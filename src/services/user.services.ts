import type { User } from "../generated/prisma/browser";
import transporter from "../libs/nodemailer";
import { connectRedis } from "../libs/redis";
import { getUserByVerificationToken } from "../repo/auth.repo";
import { createPasswordResetToken, getUserByItsId, getUsers, updatePassword } from "../repo/user.repo";
import AppError from "../utils/AppErr";
import { compareHash, createHash } from "../utils/hash";
import { verifyToken } from "../utils/token";

// A cached user stays in Redis for 1 hour (60 * 60 seconds) after being cached.
const USER_CACHE_TTL_SECONDS = 60 * 60;

const sendPasswordResetToken = async (email: string, token: string) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/password-reset?token=${token}`;

    await createPasswordResetToken(email, token);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Your Password",
        html: `<p>Reset Your Password By Clicking The Link Below</p>
           <a href="${verificationUrl}">Reset Your Password</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new AppError("Failed to send verification email", 500);
    }
};

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
    await updatePassword(user.userId, password);
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

    const user = await getUserByItsId(id);

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
    // Guarantee the Redis connection is open before any command is issued.
    const redis = await connectRedis();
    let users: Array<User> = [];

    // Step 1 — Read the list of cached user ids (empty list = cold cache).
    const cachedUsersId = await redis.lRange("usersId", 0, -1);

    // Step 2 — Cache hit: every id in the list means a cached user exists.
    if (cachedUsersId.length > 0) {
        // Each stored id is a JSON string, so parse it back before fetching.
        users = await Promise.all(
            cachedUsersId.map(user => {
                return getUserById(JSON.parse(user));
            }),
        );

        // getUserById throws for missing users, so leftovers are null entries.
        return users.filter(Boolean); // remove null values from the array
    }

    // Step 3 — Cache miss: load all users straight from the database.
    users = await getUsers();

    // Step 4 — No records matched the query.
    if (!users) {
        throw new AppError("No users found", 204);
    }

    // Step 5 — Serialize the ids so the whole list is cached as JSON strings.
    const usersId = users.filter(Boolean).map(user => JSON.stringify(user.userId));

    // Step 6 — Populate the id list so the next call takes the cache-hit path.
    await redis.lPush("usersId", usersId);

    // Step 7 — Cache every fetched user in the hash and give it the same per-field TTL as getUserById.
    await Promise.all(
        users.map(async (user, i) => {
            const userKey = `user:${user.userId}`;
            await redis.hSet("users", { [userKey]: JSON.stringify(user) });
            await redis.hExpire("users", userKey, USER_CACHE_TTL_SECONDS);
            return i;
        }),
    );

    // Step 8 — Return the users read from the database.
    return users;
};

export { getAllUsers, getUserById, sendPasswordResetToken, verifyPasswordResetToken };
