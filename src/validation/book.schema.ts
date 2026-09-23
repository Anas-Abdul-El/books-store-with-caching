import z, { coerce } from "zod";

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
    catagory: z.string(),
});

type AddBookSchemaType = z.infer<typeof addBookSchema>;

const updateBook = {
    body: z.object({
        title: z.string().optional(),
        price: z.coerce.number().optional(),
        releaseDate: z.coerce.date().optional(),
        description: z.string().optional(),
        stockCount: z.coerce.number().optional(),
        author: z.string().optional(),
        catagory: z.string().optional(),
    }),
    params: z.object({
        id: coerce.number(),
    }),
};

type UpdateBooksBodySchemaType = z.infer<typeof updateBook.body>;

export type { AddBookSchemaType, BooksSchemaType, UpdateBooksBodySchemaType };

export { addBookSchema, bookSchema, booksSchema, updateBook };
