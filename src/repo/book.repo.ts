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

const deleteBook = async (id: number): Promise<void> => {
    const book = await prisma.book.findUnique({
        where: { bookId: id },
    });
};

export { addBook, deleteBook, getAllBooks, getBook, updateBook };
