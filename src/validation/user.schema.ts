import z from "zod";

/**
 * sendPasswordResetTokenSchema validates the body used to ask for a password
 * reset: only the email of the account is needed.
 */
const sendPasswordResetTokenSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type SendPasswordResetTokenSchemaType = z.infer<typeof sendPasswordResetTokenSchema>;

/**
 * verifyPasswordResetTokenSchema validates the body used to finish a password
 * reset: the token received by mail, the current password and the new one.
 */
const verifyPasswordResetTokenSchema = z.object({
    oldPassword: z.string().min(6, "Password must be at least 6 characters long"),
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
    token: z.string(),
});

type VerifyPasswordResetTokenSchemaType = z.infer<typeof verifyPasswordResetTokenSchema>;

/**
 * getUserByIdSchema validates the route param used to read a single user.
 */
const getUserByIdSchema = z.object({
    id: z.string().uuid(),
});

type GetUserByIdSchemaType = z.infer<typeof getUserByIdSchema>;

export type { GetUserByIdSchemaType, SendPasswordResetTokenSchemaType, VerifyPasswordResetTokenSchemaType };

export { getUserByIdSchema, sendPasswordResetTokenSchema, verifyPasswordResetTokenSchema };
