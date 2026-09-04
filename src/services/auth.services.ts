/**
 * Auth service
 * @module auth.service
 * @author <Anas Abdul El>
 * @description This file defines the authentication service for the application.
 * It includes functions for user registration, login, and logout, which interact with the database and handle authentication logic.
 * @exports authController
 */

import type { User } from "../generated/prisma/browser";
import { createUser, deleteToken, getUserByEmail, getUserById } from "../repo/auth.repo";
import AppError from "../utils/AppErr";
import { compareHash, createHash } from "../utils/hash";
import { generateToken, verifyToken } from "../utils/token";
import { type AuthSchemaType, type RegisterSchemaType } from "../validation/auth.schema";

/**
 * loginUser handles the logic for logging in an existing user.
 * It takes the validated login data as input, verifies the user's credentials, and returns the user's information if successful.
 * @param data - The validated login data of type LoginSchemaType.
 * @returns A promise that resolves to the logged-in user's information.
 */
const loginUser = async (data: AuthSchemaType): Promise<Omit<User, "password">> => {
    const { email, password: sentedPass } = data;

    const user = await getUserByEmail(email);
    if (!user) throw new AppError("Invalid email or password", 401);

    const isPasswordValid = await compareHash(sentedPass, user.password);
    if (!isPasswordValid) throw new AppError("Invalid email or password", 401);

    const { isVerified, isActive } = user;

    if (!isActive) throw new AppError("User account is inactive", 403);

    if (!isVerified)
        throw new AppError("User account is not verified. Please verify your email before logging in.", 403);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

/**
 * registerUser handles the logic for registering a new user.
 * It takes the validated registration data as input and performs the necessary operations to create a new user in the database.
 * @param data - The validated registration data of type RegisterSchemaType.
 * @returns A promise that resolves to the created user's information.
 */
const registerUser = async (data: RegisterSchemaType): Promise<Omit<User, "password">> => {
    const isUserExists = await getUserByEmail(data.email);

    console.log(isUserExists);

    if (isUserExists) throw new AppError("User already exists", 400);

    const hashedPassword = await createHash(data.password);

    const user = await createUser({ ...data, password: hashedPassword });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

/**
 * refreshAccessToken handles the logic for refresh eccess token,
 * It takes the validated refresh token as input and return a new refresh token,
 * @param refreshToken - The validated refresh token of type string.
 */
const refreshAccessToken = async (refreshToken: string) => {
    let payload;
    try {
        payload = verifyToken(refreshToken, "refresh") as { userId: string };
    } catch {
        throw new AppError("Invalid or expired token", 400);
    }

    const { userId } = payload;
    const dbRefreshToken = await getUserById(userId);
    if (!dbRefreshToken) throw new AppError("Invalid or expired token", 400);

    const { expiresAt } = dbRefreshToken;

    const now = new Date();
    if (expiresAt > now) {
        await deleteToken(userId);
        throw new AppError("Invalid or expired token", 400);
    }

    const newAcessToken = generateToken({ userId }, "access");
    return newAcessToken;
};

export { loginUser, refreshAccessToken, registerUser };
