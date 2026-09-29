import type { Prisma } from "../generated/prisma/browser";
import { prisma } from "../libs/prisma";
import filterFunc from "../utils/bookFilter";
import orderFunc from "../utils/bookSort";
import removeUndefined from "../utils/removeUndefined";
import type { AddBookSchemaType, BooksSchemaType, UpdateBooksBodySchemaType } from "../validation/book.schema";

/**
 * getBook fetches a single book by its id, together with its author and its
 * category.
 * @param bookId - The id of the book to retrieve.
 * @returns A Promise resolving to the book (with its author and category) or null.
 */
const getBook = async (bookId: number) => {
    return await prisma.book.findUnique({
        where: { bookId },
        include: {
            category: true,
            author: true,
        },
    });
};

/**
 * getAllBooks fetches every book matching the query, applying the filter built
 * by filterFunc, the order built by orderFunc and the requested limit.
 * @param BookQuery - The filter/sort/pagination query.
 * @returns A Promise resolving to the matching books.
 */
const getAllBooks = async (BookQuery: BooksSchemaType) => {
    const { authorId, catagoryId, filter, filterValue, sort, sortOrder, limit } = BookQuery;
    return await prisma.book.findMany({
        where: filterFunc({ filterValue, authorId, catagoryId, filter }),
        orderBy: orderFunc({ sort, sortOrder }),
        take: limit ?? ({} as number),
    });
};

/**
 * addBook inserts a new book and creates its author and its category in the
 * same call, so the book is never stored without both relations.
 * @param book - The validated book data to insert.
 * @returns A Promise resolving to the newly created book.
 */
const addBook = (book: AddBookSchemaType) => {
    const { author, catagory, description, price, releaseDate, stockCount, title } = book;

    const addedBook = prisma.book.create({
        data: {
            title,
            price,
            releaseDate,
            description,
            stockCount,
            author: {
                create: {
                    name: author,
                },
            },
            category: {
                create: {
                    name: catagory,
                },
            },
        },
    });

    return addedBook;
};

/**
 * updateBook applies a partial update to a book. The undefined fields are
 * stripped by removeUndefined so they are left untouched, and the author and
 * the category are renamed through their own relations when they are sent.
 * @param id - The id of the book to update.
 * @param book - An object with the book fields to change (all optional).
 * @returns A Promise resolving to the updated book.
 */
const updateBook = async (id: number, book: UpdateBooksBodySchemaType) => {
    const { author, catagory, ...bookFields } = book;
    const data: Prisma.BookUpdateInput = removeUndefined(bookFields);

    if (author !== undefined) {
        const authorUpdate: Prisma.AuthorUpdateWithoutBooksInput = {};
        if (author !== undefined) authorUpdate.name = author;
        data.author = { update: authorUpdate };
    }

    if (catagory !== undefined) {
        const categoryUpdate: Prisma.CategoryUpdateWithoutBooksInput = {};
        if (catagory !== undefined) categoryUpdate.name = catagory;
        data.category = { update: categoryUpdate };
    }

    return await prisma.book.update({
        where: { bookId: id },
        data,
    });
};

/**
 * deleteBook removes a book from the database by its id.
 * @param id - The id of the book to delete.
 * @returns A Promise that resolves once the book is deleted.
 */
const deleteBook = async (id: number): Promise<void> => {
    const book = await prisma.book.findUnique({
        where: { bookId: id },
    });
};

export { addBook, deleteBook, getAllBooks, getBook, updateBook };
