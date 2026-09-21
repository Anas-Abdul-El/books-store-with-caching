import z from "zod";

const bookSchema = z.object({
    booKid: z.coerce.number(),
});

const booksSchema = z.object({
    filter: z.enum(["price", "author", "category", "releaseDate"]).optional(),
    filterValue: z.enum([">100", "<100", ">2000", "<2000"]).optional(),
    sort: z.enum(["price", "releaseDate", "title"]).optional(),
    limit: z.coerce.number().optional(),
    authorId: z.coerce.number().optional(),
    catagoryId: z.coerce.number().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});

type BooksSchemaType = z.infer<typeof booksSchema>;

const addBookSchema = z.object({
    title: z.string(),
    price: z.coerce.number(),
    releaseDate: z.coerce.date(),
    description: z.string(),
    stockCount: z.coerce.number(),
    author: z.string(),
    authorDescription: z.string().optional(),
    catagory: z.string(),
    catagoryDescription: z.string().optional(),
});

type addBookSchemaType = z.infer<typeof addBookSchema>;

export type { addBookSchemaType, BooksSchemaType };

export { addBookSchema, bookSchema, booksSchema };
