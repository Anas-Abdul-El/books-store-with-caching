import z from "zod";

const bookSchema = z.object({
    booKid: z.coerce.number(),
});

const booksSchema = z.object({
    filter: z.string().optional(),
    sort: z.string().optional(),
    limit: z.coerce.number().optional(),
});

export { bookSchema, booksSchema };
