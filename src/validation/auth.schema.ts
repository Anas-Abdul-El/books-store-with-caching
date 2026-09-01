import z from "zod";

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
});

type AuthSchemaType = z.infer<typeof authSchema>;

export type { AuthSchemaType };

export { authSchema };
