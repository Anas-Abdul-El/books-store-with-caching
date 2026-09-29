import type { BookWhereInput } from "../generated/prisma/models";
import type { BooksSchemaType } from "../validation/book.schema";

interface FilterFuncArgs {
    authorId: BooksSchemaType["authorId"];
    catagoryId: BooksSchemaType["catagoryId"];
    filter: BooksSchemaType["filter"];
    filterValue: BooksSchemaType["filterValue"];
}

/**
 * filterFunc translates the filter query params into a Prisma where clause.
 * Only the combination matching the requested filter is applied: "price" and
 * "releaseDate" read filterValue, "author" reads authorId and "category" reads
 * catagoryId. An unknown or incomplete combination filters nothing.
 * @param filterQuery - The filter field, its value and the ids it may use.
 * @returns A Prisma where input, empty when no filter applies.
 */
const filterFunc = (filterQuery: FilterFuncArgs): BookWhereInput => {
    switch (filterQuery.filter) {
        case "price":
            if (filterQuery.filterValue === ">100")
                return {
                    price: {
                        gte: 100,
                    },
                };
            else if (filterQuery.filterValue === "<100")
                return {
                    price: {
                        lte: 100,
                    },
                };
            break;

        case "author":
            if (filterQuery.authorId !== undefined)
                return {
                    authorId: filterQuery.authorId,
                };
            break;

        case "category":
            if (filterQuery.catagoryId !== undefined)
                return {
                    categoryId: filterQuery.catagoryId,
                };
            break;

        case "releaseDate":
            if (filterQuery.filterValue === ">2000") {
                return {
                    releaseDate: {
                        gte: "2000",
                    },
                };
            } else if (filterQuery.filterValue === "<2000") {
                return {
                    releaseDate: {
                        lte: "2000",
                    },
                };
            }
            break;
    }

    return {};
};

export default filterFunc;
