import z, { coerce } from "zod";

/**
 * bookSchema validates the route param used to read a single book.
 * The field name keeps its historical spelling, so renaming it would break
 * every client already sending it.
 */
const bookSchema = z.object({
    booKid: z.coerce.number(),
});

/**
 * booksSchema validates the query params used to list books: the filter field
 * with its value, the sort field with its direction, the author/category ids
 * and the pagination limit. The catagoryId param keeps its historical
 * spelling for the same reason as bookSchema.
 */
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

/**
 * addBookSchema validates the body used to create a book. Every field is
 * required, and the author and the category are sent by name, so the repo can
 * create both relations along with the book.
 */
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

/**
 * updateBook holds the schemas used to update a book:
 * the route params (the book id) and the body (the fields to change).
 * Every body field is optional, so a partial update only writes what the client
 * sent.
 */
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

type UpdateBooksParamsSchemaType = z.infer<typeof updateBook.params>;

/**
 * deleteBook validates the route param used to delete a book.
 */
const deleteBook = z.object({
    id: coerce.number(),
});

type DeleteBookSchemaType = z.infer<typeof deleteBook>;

export type {
    AddBookSchemaType,
    BooksSchemaType,
    DeleteBookSchemaType,
    UpdateBooksBodySchemaType,
    UpdateBooksParamsSchemaType,
};

export { addBookSchema, bookSchema, booksSchema, deleteBook, updateBook };
