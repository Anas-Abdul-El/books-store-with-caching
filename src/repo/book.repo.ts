import type { Book } from "../generated/prisma/browser";
import { prisma } from "../libs/prisma";
import filterFunc from "../utils/bookFilter";
import orderFunc from "../utils/bookSort";
import type { AddBookSchemaType, BooksSchemaType } from "../validation/book.schema";

const getBook = async (bookId: number) => {
    return await prisma.book.findUnique({
        where: { bookId },
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
    const {
        author,
        catagory,
        description,
        price,
        releaseDate,
        stockCount,
        title,
        authorDescription,
        catagoryDescription,
    } = book;

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
                    description: authorDescription ?? null,
                },
            },
            category: {
                create: {
                    name: catagory,
                    description: catagoryDescription ?? null,
                },
            },
        },
    });

    return addedBook;
};

const updateBook = async (id: number, book: Book) => {
    return await prisma.book.update({
        where: {
            bookId: id,
        },
        data: book,
    });
};

export { addBook, getAllBooks, getBook, updateBook };
