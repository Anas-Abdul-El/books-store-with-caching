import { prisma } from "../libs/prisma";

/**
 * createPasswordResetToken updates the user's record in the database with a new password Reset token.
 * The code expires 10 minutes after being created.
 * @param userId - The ID of the user for whom the password Reset code is being created.
 * @param code - The password Reset code to be associated with the user.
 * @returns A Promise that resolves to the updated user object with the new verification token.
 */
const createPasswordResetToken = async (email: string, code: string) => {
    return await prisma.user.update({
        where: {
            email,
        },
        data: {
            resetPasswordCode: code,
            resetPasswordCodeExpireAt: new Date(Date.now() + 60 * 60 * 24 * 1000),
        },
    });
};

/**
 * updatePassword updates the user's record in
 * the database with a new password.
 * @param userId - The ID of the user for whom the
 * @param password - The new password to be associated with the user
 * @returns A Promise that resolves to the updated user object
 */
const updatePassword = async (userId: string, password: string) => {
    return await prisma.user.update({
        where: {
            userId,
        },
        data: {
            password,
        },
    });
};

export { createPasswordResetToken, updatePassword };
