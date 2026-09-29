import type { NextFunction, Request, Response } from "express";
import type { Book } from "../generated/prisma/browser";
import { bookService } from "../services";
import { getAllBook } from "../services/book.services";
import type {
    AddBookSchemaType,
    BooksSchemaType,
    DeleteBookSchemaType,
    UpdateBooksBodySchemaType,
    UpdateBooksParamsSchemaType,
} from "../validation/book.schema";

/**
 * getBookById fetches a single book by its id and returns it to the caller.
 * The id is read from the request body; the actual lookup is delegated to the
 * bookService.
 * @param req - The Express request; expects {@link BookRouterRequestBody} containing the book id.
 * @param res - The Express response typed as {@link Response}<{@link Book}>; sends the fetched book to the client.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise resolving to the book object.
 */
const getBookById = async (req: Request<{ id: string }, {}, {}, {}>, res: Response<Book>, next: NextFunction) => {
    const bookId = req.params.id;

    const book = await bookService.getBookById(parseInt(bookId));

    res.send(book);
};

/**
 * getAllbook fetches all books matching the query (filter, sort and pagination)
 * and sends them to the client. The listing is served by getAllBook, which
 * reads Redis first and only queries PostgreSQL on a cache miss.
 * @param req - The Express request; expects the query params validated by {@link booksSchema}.
 * @param res - The Express response typed as {@link Response}<Array<{@link Book}>>; sends the matching books to the client.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the books are sent.
 */
const getAllbook = async (
    req: Request<{}, {}, {}, BooksSchemaType>,
    res: Response<Array<Book>>,
    next: NextFunction,
) => {
    const bookQuery = req.query;

    const books = await getAllBook(bookQuery);

    res.send(books);
};

/**
 * addBook creates a new book out of the validated body and sends the created
 * book back. The author and the category are created together with the book, so
 * a book always ends up linked to a row of each.
 * @param req - The Express request; expects the new book data in the body.
 * @param res - The Express response typed as {@link Response}<{@link Book}>; sends the created book to the client.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the created book is sent.
 */
const addBook = async (req: Request<{}, {}, AddBookSchemaType, {}>, res: Response<Book>, next: NextFunction) => {
    const bookData = req.body;

    const addedBook = await bookService.addBook(bookData);

    res.send(addedBook);
};

/**
 * updateBook updates an existing book and sends the updated book back. Only
 * the fields present in the body are written, so the ones the client left out
 * keep their stored value.
 * @param req - The Express request; expects the book id in the route params and the fields to change in the body.
 * @param res - The Express response typed as {@link Response}<{@link Book}>; sends the updated book to the client.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the updated book is sent.
 */
const updateBook = async (
    req: Request<UpdateBooksParamsSchemaType, {}, UpdateBooksBodySchemaType, {}>,
    res: Response<Book>,
    next: NextFunction,
) => {
    const {
        body,
        params: { id },
    } = req;

    const newBook = await bookService.updateBook(id, body);

    res.send(newBook);
};

/**
 * deleteBook deletes a book and sends a confirmation message back. The book id
 * comes from the route params, never from the body.
 * @param req - The Express request; expects the book id in the route params.
 * @param res - The Express response that sends the confirmation message.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the book is deleted.
 */
const deleteBook = async (
    req: Request<DeleteBookSchemaType, {}, {}, {}>,
    res: Response<string>,
    next: NextFunction,
) => {
    const id = req.params.id;

    await bookService.deleteBook(id);

    res.send("the book deleted succ");
};

export default { getBookById, getAllbook, addBook, updateBook, deleteBook };
