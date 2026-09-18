import type { Book } from "../generated/prisma/browser";
import { connectRedis, redisClient } from "../libs/redis";
import { bookRepo } from "../repo";
import AppError from "../utils/AppErr";
import createBooksCacheKey from "../utils/bookCacheKey";
import type { BooksSchemaType } from "../validation/book.schema";

// A cached book stays in Redis for 1.5 hour (60 * 90 seconds) after being cached.
const BOOK_CACHE_TTL_SECONDS = 60 * 90;

/**
 * getBookById retrieves a single book by their unique ID, using a Redis hash
 * (key: "books", field: "book:<bookid>") as a cache in front of the database so
 * repeated reads avoid hitting PostgreSQL.
 *
 * Flow:
 *  1. Ensure the Redis client is connected.
 *  2. Try to read the user from the "books" hash (cache hit path).
 *  3. On a hit, parse the stored JSON string and return it — no DB query.
 *  4. On a miss, fetch the book from the DB with Prisma.
 *  5. If the book does not exist, throw a 404 AppError.
 *  6. Otherwise cache the DB result as a JSON string in the hash, then return it.
 *
 * @param bookid - The unique ID of the book to load.
 * @returns A Promise resolving to the book (from cache or database).
 * @throws {AppError} With a 404 status when the user is not found.
 */
const getBookById = async (bookId: number): Promise<Book> => {
    const redis = await connectRedis();

    const bookKey = `book:${bookId}`;
    const cachedBook = await redis.hGet("books", bookKey);

    if (cachedBook) {
        const parsedBook = JSON.parse(cachedBook) as Book;
        if (parsedBook.bookId != bookId) {
            throw new AppError("Invalid cached book data", 500);
        }

        return parsedBook;
    }

    const book = await bookRepo.getBook(bookId);

    if (!book) throw new AppError("Book not found", 404);

    await redis.hSet("users", { [bookKey]: JSON.stringify(book) });

    await redisClient.hExpire("users", bookKey, BOOK_CACHE_TTL_SECONDS);

    return book;
};

const getAllBook = async (bookQuery: BooksSchemaType): Promise<Array<Book>> => {
    const redis = await connectRedis();

    const cachedBookKey = createBooksCacheKey(bookQuery);

    const cachedBooks = await redis.get(cachedBookKey);

    if (cachedBooks) return JSON.parse(cachedBooks);

    const books = await bookRepo.getAllBooks(bookQuery);

    if (!books) throw new AppError("Empty", 204);

    await redis.set(cachedBookKey, JSON.stringify(books), { EX: BOOK_CACHE_TTL_SECONDS });

    return books;
};

export { getAllBook, getBookById };
