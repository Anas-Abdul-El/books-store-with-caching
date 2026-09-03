//
// user.repo.ts
//
// This file defines the repository functions for user-related operations in the application.
// It interacts with the database to perform CRUD operations on user data, such as retrieving users by email or ID.
//

import type { User } from "../generated/prisma/browser";
import { prisma } from "../libs/prisma";

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

export { getUserByEmail };
