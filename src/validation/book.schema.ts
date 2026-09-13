import z from "zod";

const bookSchema = z.object({
    booKid: z.number(),
});

export { bookSchema };
