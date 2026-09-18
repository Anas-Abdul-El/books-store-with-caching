import { prisma } from "../libs/prisma";

const getBook = async (bookId: number) => {
    return await prisma.book.findUnique({
        where: { bookId },
    });
};

const getAllBooks = async () => {
    return await prisma.book.findMany();
};

export { getAllBooks, getBook };
