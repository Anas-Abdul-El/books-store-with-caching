import { prisma } from "../libs/prisma";
import filterFunc from "../utils/bookFilter";
import orderFunc from "../utils/bookSort";
import type { BooksSchemaType } from "../validation/book.schema";

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

export { getAllBooks, getBook };
