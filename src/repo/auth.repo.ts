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

/**
 * getUserById retrieves a user from the database based on their its Id.
 * @param userId - The user id of the user to retrieve.
 * @returns A Promise that resolves to the user object if found, or null if no user exists with the given id.
 */
const getUserById = async (userId: string) => {
    return await prisma.session.findUnique({
        where: {
            userId,
        },
        select: {
            expiresAt: true,
        },
    });
};

/**
 * deleteToken deletes all session tokens associated with a specific user from the database.
 * @param userId - The ID of the user whose session tokens should be deleted.
 * @returns A Promise that resolves to the result of the delete operation.
 */
const deleteToken = async (userId: string) => {
    return await prisma.session.deleteMany({
        where: {
            userId,
        },
    });
};

/**
 * createVerificationCode updates the user's record in the database with a new verification code.
 * The code expires 10 minutes after being created.
 * @param userId - The ID of the user for whom the verification code is being created.
 * @param code - The verification code to be associated with the user.
 * @returns A Promise that resolves to the updated user object with the new verification code.
 */
export const createVerificationCode = async (email: string, code: string) => {
    return await prisma.user.update({
        where: {
            email,
        },
        data: {
            verificationCode: code,
            verificationCodeExpiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000),
        },
    });
};

/**
 * getUserByVerificationToken retrieves a user from the database based on their verification token.
 * @param token - The verification token associated with the user.
 * @returns A Promise that resolves to the user object if found, or null if no user exists with the given token.
 */
export const getUserByVerificationToken = async (token: string) => {
    return await prisma.user.findFirst({
        where: {
            verificationCode: token,
        },
    });
};

/**
 * updateUserVerificationStatus updates the verification status of a user in the database.
 * It sets the isVerified field to true and clears the verification code and its expiration date.
 * @param userId - The ID of the user whose verification status is being updated.
 * @param isVerified - A boolean indicating whether the user is verified (true) or not (false).
 * @returns A Promise that resolves to the updated user object with the new verification status.
 */
export const updateUserVerificationStatus = async (userId: string, isVerified: boolean) => {
    return await prisma.user.update({
        where: {
            userId,
        },
        data: {
            isVerified,
            verificationCode: null,
            verificationCodeExpiresAt: null,
        },
    });
};

export { createUser, deleteToken, getUserByEmail, getUserById, saveSessionToken };
