//
// user.repo.ts
//
// This file defines the repository functions for user-related operations in the application.
// It interacts with the database to perform CRUD operations on user data, such as retrieving users by email or ID.
//

import type { User } from "../generated/prisma/browser";
import { prisma } from "../libs/prisma";
import type { RegisterSchemaType } from "../validation/auth.schema";

/**
 * getUserByEmail retrieves a user from the database based on their email address.
 * @param email - The email address of the user to retrieve.
 * @returns A Promise that resolves to the user object if found, or null if no user exists with the given email.
 */
const getUserByEmail = async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: {
            email,
        },
    });
};

/**
 * saveSessionToken saves a new session token for a user in the database.
 * It associates the token with the user's ID and sets an expiration date for the token.
 * @param userId - The ID of the user for whom the session token is being saved.
 * @param token - The session token to be saved in the database.
 * @param expiresAt - The expiration date and time for the session token.
 * @returns A Promise that resolves to the newly created session object containing the token and its expiration date.
 */
const saveSessionToken = async (userId: string, token: string, expiresAt: Date) => {
    return await prisma.session.create({
        data: {
            userId,
            refreshToken: token,
            expiresAt,
        },
    });
};

type RegisteredUser = RegisterSchemaType;
/**
 * createUser creates a new user in the database with the provided user information.
 * @param userInfo - An object containing the user's information, including name, email, password, and role.
 * @returns A Promise that resolves to the newly created user object.
 */
const createUser = async (userInfo: RegisteredUser) => {
    return await prisma.user.create({
        data: {
            email: userInfo.email,
            password: userInfo.password,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
        },
    });
};

export { createUser, getUserByEmail, saveSessionToken };
