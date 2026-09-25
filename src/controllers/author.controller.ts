import type { NextFunction, Request, Response } from "express";
import type { Author } from "../generated/prisma/browser";
import { authorService } from "../services";
import type {
    AddAuthorSchemaType,
    AuthorsSchemaType,
    DeleteAuthorSchemaType,
    UpdateAuthorsBodySchemaType,
    UpdateAuthorsParamsSchemaType,
} from "../validation/author.schema";

/**
 * getAuthorById fetches a single author by its id and sends it to the client.
 * The id is read from the route params; the lookup is delegated to authorService.
 * @param req - The Express request; expects the author id in the route params.
 * @param res - The Express response typed as {@link Response}<{@link Author}>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the author is sent.
 */
const getAuthorById = async (
    req: Request<DeleteAuthorSchemaType, {}, {}, {}>,
    res: Response<Author>,
    next: NextFunction,
) => {
    const authorId = req.params.id;

    const author = await authorService.getAuthorById(authorId);

    res.send(author);
};

/**
 * getAllAuthors fetches all authors matching the query (sort/pagination) and
 * sends them to the client.
 * @param req - The Express request; expects the query params.
 * @param res - The Express response typed as {@link Response}<Array<{@link Author}>>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the authors are sent.
 */
const getAllAuthors = async (
    req: Request<{}, {}, {}, AuthorsSchemaType>,
    res: Response<Array<Author>>,
    next: NextFunction,
) => {
    const query = req.query;

    const authors = await authorService.getAllAuthors(query);

    res.send(authors);
};

/**
 * addAuthor creates a new author from the request body and sends it back.
 * @param req - The Express request; expects the author data in the body.
 * @param res - The Express response typed as {@link Response}<{@link Author}>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the created author is sent.
 */
const addAuthor = async (
    req: Request<{}, {}, AddAuthorSchemaType, {}>,
    res: Response<Author>,
    next: NextFunction,
) => {
    const authorData = req.body;

    const addedAuthor = await authorService.addAuthor(authorData);

    res.send(addedAuthor);
};

/**
 * updateAuthor updates an existing author from the request body and sends the
 * updated author back.
 * @param req - The Express request; expects the author id in params and the
 * partial data in the body.
 * @param res - The Express response typed as {@link Response}<{@link Author}>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the updated author is sent.
 */
const updateAuthor = async (
    req: Request<UpdateAuthorsParamsSchemaType, {}, UpdateAuthorsBodySchemaType, {}>,
    res: Response<Author>,
    next: NextFunction,
) => {
    const {
        body,
        params: { id },
    } = req;

    const updatedAuthor = await authorService.updateAuthor(id, body);

    res.send(updatedAuthor);
};

/**
 * deleteAuthor deletes an existing author by id and sends a confirmation message.
 * @param req - The Express request; expects the author id in the route params.
 * @param res - The Express response that sends the confirmation message.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the author is deleted.
 */
const deleteAuthor = async (
    req: Request<DeleteAuthorSchemaType, {}, {}, {}>,
    res: Response<string>,
    next: NextFunction,
) => {
    const id = req.params.id;

    await authorService.deleteAuthor(id);

    res.send("the author deleted succ");
};

export default { getAuthorById, getAllAuthors, addAuthor, updateAuthor, deleteAuthor };