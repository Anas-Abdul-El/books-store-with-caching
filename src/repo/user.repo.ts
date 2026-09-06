import { prisma } from "../libs/prisma";

/**
 * createPasswordResetCode updates the user's record in the database with a new password Reset code.
 * The code expires 10 minutes after being created.
 * @param userId - The ID of the user for whom the password Reset code is being created.
 * @param code - The password Reset code to be associated with the user.
 * @returns A Promise that resolves to the updated user object with the new verification code.
 */
export const createPasswordResetCode = async (email: string, code: string) => {
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

export const updatePassword = async (userId: string, password: string) => {
    return await prisma.user.update({
        where: {
            userId,
        },
        data: {
            password,
        },
    });
};
