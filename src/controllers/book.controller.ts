import type { NextFunction, Request, Response } from "express";
import type { Book } from "../generated/prisma/browser";
import { bookService } from "../services";
import type { BookRouterRequestBody } from "../types/book";

/**
 * getBookById fetches a single book by its id and returns it to the caller.
 * The id is read from the request body; the actual lookup is delegated to the
 * bookService.
 * @param req - The Express request; expects {@link BookRouterRequestBody} containing the book id.
 * @param res - The Express response typed as {@link Response}<{@link Book}>; sends the fetched book to the client.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise resolving to the book object.
 */
const getBookById = async (
    req: Request<{}, {}, BookRouterRequestBody, {}>,
    res: Response<Book>,
    next: NextFunction,
) => {
    const bookId = req.body.bookId;

    const book = await bookService.getBookById(bookId);

    res.send(book);
};

export default { getBookById };
