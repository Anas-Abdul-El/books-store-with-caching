import type { Prisma } from "../generated/prisma/browser";
import { prisma } from "../libs/prisma";
import filterFunc from "../utils/bookFilter";
import orderFunc from "../utils/bookSort";
import removeUndefined from "../utils/removeUndefined";
import type { AddBookSchemaType, BooksSchemaType, UpdateBooksBodySchemaType } from "../validation/book.schema";

const getBook = async (bookId: number) => {
    return await prisma.book.findUnique({
        where: { bookId },
        include: {
            category: true,
            author: true,
        },
    });
};

const getAllBooks = async (BookQuery: BooksSchemaType) => {
    const { authorId, catagoryId, filter, filterValue, sort, sortOrder, limit } = BookQuery;
    return await prisma.book.findMany({
        where: filterFunc({ filterValue, authorId, catagoryId, filter }),
        orderBy: orderFunc({ sort, sortOrder }),
        take: limit ?? ({} as number),
    });
};

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
 * updateBook updates an existing book's scalar fields and its related author and
 * category names/descriptions in the database. Author/category fields from the
 * request are mapped onto nested relation updates.
 * @param id - The ID of the book to update.
 * @param book - Partial book data; the author/category keys update the relations.
 * @returns A Promise resolving to the updated book object.
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

export { addBook, getAllBooks, getBook, updateBook };
