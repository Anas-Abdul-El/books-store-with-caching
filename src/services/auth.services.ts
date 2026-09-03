/**
 * Auth service
 * @module auth.service
 * @author <Anas Abdul El>
 * @description This file defines the authentication service for the application.
 * It includes functions for user registration, login, and logout, which interact with the database and handle authentication logic.
 * @exports authController
 */

import type { User } from "../generated/prisma/browser";
import { getUserByEmail } from "../repo/auth.repo";
import AppError from "../utils/AppErr";
import { compareHash } from "../utils/hash";
import type { AuthSchemaType } from "../validation/auth.schema";

/**
 * loginUser handles the logic for logging in an existing user.
 * It takes the validated login data as input, verifies the user's credentials, and returns the user's information if successful.
 * @param data - The validated login data of type LoginSchemaType.
 * @returns A promise that resolves to the logged-in user's information.
 */
export const loginUser = async (data: AuthSchemaType): Promise<Omit<User, "password">> => {
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
