import type { BooksSchemaType } from "../validation/book.schema";

interface orderFuncArgs {
    sort: BooksSchemaType["sort"];
    sortOrder: BooksSchemaType["sortOrder"];
}

/**
 * orderFunc builds the Prisma orderBy object for the books list query.
 * @param sortArgs - The requested sort field and direction.
 * @returns A Prisma orderBy object (defaults to ascending title).
 */
const orderFunc = ({ sort = "title", sortOrder = "asc" }: orderFuncArgs) => {
    switch (sort) {
        case "price":
            return {
                price: sortOrder,
            };
            break;
        case "releaseDate":
            return {
                releaseDate: sortOrder,
            };
            break;
        case "title":
            return {
                title: sortOrder,
            };
            break;
    }
};

export default orderFunc;
