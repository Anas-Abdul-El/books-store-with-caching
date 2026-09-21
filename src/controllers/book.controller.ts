import type { NextFunction, Request, Response } from "express";
import type { Book } from "../generated/prisma/browser";
import { bookService } from "../services";
import { getAllBook } from "../services/book.services";
import type { AddBookSchemaType, BooksSchemaType } from "../validation/book.schema";

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

const getAllbook = async (
    req: Request<{}, {}, {}, BooksSchemaType>,
    res: Response<Array<Book>>,
    next: NextFunction,
) => {
    const bookQuery = req.query;

    const books = await getAllBook(bookQuery);

    res.send(books);
};

const addBook = async (req: Request<{}, {}, AddBookSchemaType, {}>, res: Response<Book>, next: NextFunction) => {
    const bookData = req.body;

    const addedBook = await bookService.addBook(bookData);

    res.send(addedBook);
};

export default { getBookById, getAllbook, addBook };
