/**
 * This file contains the Zod schema for authentication operations such as login and registration.
 * @module auth.schema
 * @author <Anas Abdul El>
 * @description This file contains the Zod schema for authentication operations such as login and registration.
 * @exports authSchema
 * @exports AuthSchemaType
 */

import z from "zod";

// Define the Zod schema for authentication operations
const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
});

// Define the TypeScript type for the authentication schema
type AuthSchemaType = z.infer<typeof authSchema>;

// Define the Zod schema for registration schema
const registerSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters long"),
    lastName: z.string().min(3, "Last name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Define the TypeScript type for the registration schema
type RegisterSchemaType = z.infer<typeof registerSchema>;

// Define the Zod schema for sending verification code schema
const sendVerificationCodeSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
    }),
});

// Define the Zod schema for verifying verification code types
type SendVerificationCodeSchemaType = z.infer<typeof sendVerificationCodeSchema>;

// Define the Zod schema for verifying verification code schema
const verifyVerificationCodeSchema = z.object({
    body: z.object({
        token: z.string(),
    }),
});

// Define the Zod schema for verifying verification code types
type VerifyVerificationCodeSchemaType = z.infer<typeof verifyVerificationCodeSchema>;

// export the schema and its types

export type { AuthSchemaType, RegisterSchemaType, SendVerificationCodeSchemaType, VerifyVerificationCodeSchemaType };

export { authSchema, registerSchema, sendVerificationCodeSchema, verifyVerificationCodeSchema };
