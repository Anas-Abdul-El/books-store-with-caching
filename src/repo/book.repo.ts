import { prisma } from "../libs/prisma";

const getBook = async (bookId: number) => {
    return await prisma.book.findUnique({
        where: { bookId },
    });
};

export { getBook };
