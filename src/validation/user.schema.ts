import z from "zod";

const sendPasswordResetTokenSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type SendPasswordResetTokenSchemaType = z.infer<typeof sendPasswordResetTokenSchema>;

const verifyPasswordResetTokenSchema = z.object({
    oldPassword: z.string().min(6, "Password must be at least 6 characters long"),
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
    token: z.string(),
});

type VerifyPasswordResetTokenSchemaType = z.infer<typeof verifyPasswordResetTokenSchema>;

const getUserByIdSchema = z.object({
    id: z.string().uuid(),
});

type GetUserByIdSchemaType = z.infer<typeof getUserByIdSchema>;

export type { GetUserByIdSchemaType, SendPasswordResetTokenSchemaType, VerifyPasswordResetTokenSchemaType };

export { getUserByIdSchema, sendPasswordResetTokenSchema, verifyPasswordResetTokenSchema };
