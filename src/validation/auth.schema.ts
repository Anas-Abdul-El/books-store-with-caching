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

const registerSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters long"),
    lastName: z.string().min(3, "Last name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

type RegisterSchemaType = z.infer<typeof registerSchema>;

export type { AuthSchemaType, RegisterSchemaType };

export { authSchema, registerSchema };
