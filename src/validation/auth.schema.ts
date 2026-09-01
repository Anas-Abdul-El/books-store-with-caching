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

export type { AuthSchemaType };

export { authSchema };
