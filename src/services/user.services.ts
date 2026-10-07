import type { User } from "../generated/prisma/browser";
import { connectRedis } from "../libs/redis";
import { userRepo } from "../repo";
import { getUserByVerificationToken } from "../repo/auth.repo";
import AppError from "../utils/AppErr";
import { compareHash, createHash } from "../utils/hash";
import { verifyToken } from "../utils/token";
import { emailQueue } from "../jobs/email.job";

// A cached user stays in Redis for 1 hour (60 * 60 seconds) after being cached.
const USER_CACHE_TTL_SECONDS = 60 * 60;

/**
 * sendPasswordResetToken stores the reset token of a user and mails them a link
 * holding it. The link is built from FRONTEND_URL, so the token travels by mail
 * and never through the API response.
 *
 * Flow:
 *  1. Build the reset URL pointing at the frontend with the token as a query param.
 *  2. Persist the token (and its expiry) through userRepo.createPasswordResetToken.
 *  3. Send the mail by pushing a job to the email queue, so the request
 *     returns immediately and the SMTP call runs in the background.
 *  4. On a queue failure, throw a 500 AppError so the caller is not told the
 *     reset succeeded when no mail is on its way.
 *
 * @param email - The email of the account asking for a password reset.
 * @param token - The freshly signed verification token.
 * @returns A Promise that resolves once the token is stored and the mail is sent.
 * @throws {AppError} With a 500 status when the mail could not be sent.
 */
const sendPasswordResetToken = async (email: string, token: string) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/password-reset?token=${token}`;

    await userRepo.createPasswordResetToken(email, token);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Your Password",
        html: `<p>Reset Your Password By Clicking The Link Below</p>
           <a href="${verificationUrl}">Reset Your Password</a>`,
    };

    try {
        await emailQueue.add("send-password-reset-email", {
            to: email,
            subject: mailOptions.subject,
            html: mailOptions.html,
            from: mailOptions.from,
        });
    } catch (error) {
        throw new AppError("Failed to send verification email", 500);
    }
};

/**
 * verifyPasswordResetToken checks a password reset request and, when it holds
 * up, replaces the password of the account with the new hashed one. The token
 * must be signed with the verification secret, still unexpired, and paired with
 * the current password of the account, so a stolen mail alone is not enough.
 *
 * Flow:
 *  1. Verify the signature of the token with verifyToken.
 *  2. Load the user holding that token with getUserByVerificationToken.
 *  3. Compare the sent old password against the stored hash.
 *  4. Make sure the reset code has not expired.
 *  5. Hash the new password and store it through userRepo.updatePassword.
 *
 * @param newPassword - The plain new password sent by the client.
 * @param oldPassword - The current password of the account.
 * @param token - The verification token the user received by mail.
 * @returns A Promise that resolves once the new password is stored.
 * @throws {AppError} With a 400 status when the token, the old password or the expiry do not check out.
 */
const verifyPasswordResetToken = async (newPassword: string, oldPassword: string, token: string) => {
    const isTokenValid = verifyToken(token, "verify");
    if (isTokenValid) throw new AppError("invalid or expired token", 400);

    const user = await getUserByVerificationToken(token);
    if (!user) throw new AppError("Invalid or expired verification token", 400);

    const isPasswordCorrect = await compareHash(oldPassword, user.password);
    if (!isPasswordCorrect) throw new AppError("wrong password", 400);

    const now = new Date();
    if (user.resetPasswordCodeExpiresAt! > now) {
        throw new AppError("Invalid or expired verification token", 400);
    }

    const password = await createHash(newPassword);
    await userRepo.updatePassword(user.userId, password);
};

/**
 * getUserById retrieves a single user by their unique ID, using a Redis hash
 * (key: "users", field: "user:<id>") as a cache in front of the database so
 * repeated reads avoid hitting PostgreSQL.
 *
 * Flow:
 *  1. Ensure the Redis client is connected.
 *  2. Try to read the user from the "users" hash (cache hit path).
 *  3. On a hit, parse the stored JSON string and return it — no DB query.
 *  4. On a miss, fetch the user from the DB with Prisma.
 *  5. If the user does not exist, throw a 404 AppError.
 *  6. Otherwise cache the DB result as a JSON string in the hash, then return it.
 *
 * @param id - The unique ID of the user to load.
 * @returns A Promise resolving to the user (from cache or database).
 * @throws {AppError} With a 404 status when the user is not found.
 */
const getUserById = async (id: string): Promise<User> => {
    const redis = await connectRedis();

    const userKey = `user:${id}`;

    const cachedUser = await redis.hGet("users", userKey);

    if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser) as User;

        if (parsedUser.userId !== id) {
            throw new AppError("Invalid cached user data", 500);
        }

        return parsedUser;
    }

    const user = await userRepo.getUserByItsId(id);

    if (!user) throw new AppError("User not found", 404);

    await redis.hSet("users", { [userKey]: JSON.stringify(user) });

    await redis.hExpire("users", userKey, USER_CACHE_TTL_SECONDS);

    return user;
};

/**
 * getAllUsers retrieves all users, using Redis to avoid hitting the database on
 * every request. A Redis list ("usersId") holds the cached user ids, and each
 * user body lives in the "users" hash (field "user:<id>"), as with getUserById.
 *
 * Flow:
 *  1. Ensure the Redis client is connected.
 *  2. Read every cached user id from the "usersId" list.
 *  3. If the list is not empty (cache hit): load each user from the hash via
 *     getUserById, and return them (null entries filtered out).
 *  4. On a miss: fetch all users from the DB with getUsers().
 *  5. If no users exist, throw a 204 AppError.
 *  6. Push the user ids into the "usersId" list and cache every user in the
 *     "users" hash, each with the same per-field TTL as getUserById.
 *  7. Return the users read from the database.
 *
 * @returns A Promise resolving to the list of users (from cache or database).
 * @throws {AppError} With a 204 status when no users are found.
 */
const getAllUsers = async (): Promise<Array<User | null>> => {
    const redis = await connectRedis();
    let users: Array<User> = [];

    const cachedUsersId = await redis.lRange("usersId", 0, -1);

    if (cachedUsersId.length > 0) {
        users = await Promise.all(
            cachedUsersId.map(user => {
                return getUserById(JSON.parse(user));
            }),
        );

        return users.filter(Boolean); // remove null values from the array
    }

    users = await userRepo.getUsers();

    if (!users) {
        throw new AppError("No users found", 204);
    }

    const usersId = users.filter(Boolean).map(user => JSON.stringify(user.userId));

    await redis.lPush("usersId", usersId);

    await Promise.all(
        users.map(async (user, i) => {
            const userKey = `user:${user.userId}`;
            await redis.hSet("users", { [userKey]: JSON.stringify(user) });
            await redis.hExpire("users", userKey, USER_CACHE_TTL_SECONDS);
            return i;
        }),
    );

    return users;
};

export { getAllUsers, getUserById, sendPasswordResetToken, verifyPasswordResetToken };
