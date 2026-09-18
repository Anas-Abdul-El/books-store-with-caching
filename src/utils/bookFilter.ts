import type { BookWhereInput } from "../generated/prisma/models";
import type { BooksSchemaType } from "../validation/book.schema";

interface FilterFuncArgs {
    authorId: BooksSchemaType["authorId"];
    catagoryId: BooksSchemaType["catagoryId"];
    filter: BooksSchemaType["filter"];
    filterValue: BooksSchemaType["filterValue"];
}

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
