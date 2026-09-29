/**
 * This file contains the Zod schema for authentication operations such as login and registration.
 * @module auth.schema
 * @author <Anas Abdul El>
 * @description This file contains the Zod schema for authentication operations such as login and registration.
 * @exports authSchema
 * @exports AuthSchemaType
 */

import z from "zod";

/**
 * authSchema validates the login credentials: an email address and a password
 * of at least 6 characters.
 */
const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
});

// Define the TypeScript type for the authentication schema
type AuthSchemaType = z.infer<typeof authSchema>;

/**
 * registerSchema validates the body used to sign up: both names, a valid email
 * and a password of at least 6 characters. The custom messages are what the
 * client shows the user, so they are written in plain English.
 */
const registerSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters long"),
    lastName: z.string().min(3, "Last name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Define the TypeScript type for the registration schema
type RegisterSchemaType = z.infer<typeof registerSchema>;

/**
 * sendVerificationCodeSchema validates the body used to (re)send the account
 * verification mail: the email of the account to verify.
 */
const sendVerificationCodeSchema = z.object({
    email: z.string().email("Invalid email address"),
});

// Define the Zod schema for verifying verification code types
type SendVerificationCodeSchemaType = z.infer<typeof sendVerificationCodeSchema>;

/**
 * verifyVerificationCodeSchema validates the body used to confirm an account:
 * the verification token the user received by mail.
 */
const verifyVerificationCodeSchema = z.object({
    token: z.string(),
});

// Define the Zod schema for verifying verification code types
type VerifyVerificationCodeSchemaType = z.infer<typeof verifyVerificationCodeSchema>;

// export the schema and its types

export type { AuthSchemaType, RegisterSchemaType, SendVerificationCodeSchemaType, VerifyVerificationCodeSchemaType };

export { authSchema, registerSchema, sendVerificationCodeSchema, verifyVerificationCodeSchema };
