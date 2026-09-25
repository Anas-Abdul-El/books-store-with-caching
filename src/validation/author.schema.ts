import z, { coerce } from "zod";

/**
 * authorSchema validates the route param used to fetch a single author by id.
 */
const authorSchema = z.object({
    id: coerce.number(),
});

type AuthorSchemaType = z.infer<typeof authorSchema>;

/**
 * authorsSchema validates the query params used to list authors
 * (sort, sort order, and pagination limit).
 */
const authorsSchema = z.object({
    sort: z.enum(["name", "authorId"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    limit: coerce.number().optional(),
});

type AuthorsSchemaType = z.infer<typeof authorsSchema>;

/**
 * addAuthorSchema validates the body used to create a new author.
 */
const addAuthorSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});

type AddAuthorSchemaType = z.infer<typeof addAuthorSchema>;

/**
 * updateAuthor holds the schemas used to update an author:
 * the route params (author id) and the optional body fields.
 */
const updateAuthor = {
    params: z.object({
        id: coerce.number(),
    }),
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
    }),
};

type UpdateAuthorsBodySchemaType = z.infer<typeof updateAuthor.body>;

type UpdateAuthorsParamsSchemaType = z.infer<typeof updateAuthor.params>;

/**
 * deleteAuthorSchema validates the route param used to delete an author.
 */
const deleteAuthor = z.object({
    id: coerce.number(),
});

type DeleteAuthorSchemaType = z.infer<typeof deleteAuthor>;

export type {
    AddAuthorSchemaType,
    AuthorSchemaType,
    AuthorsSchemaType,
    DeleteAuthorSchemaType,
    UpdateAuthorsBodySchemaType,
    UpdateAuthorsParamsSchemaType,
};

export { addAuthorSchema, authorSchema, authorsSchema, deleteAuthor, updateAuthor };