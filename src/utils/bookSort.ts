import type { BooksSchemaType } from "../validation/book.schema";

interface orderFuncArgs {
    sort: BooksSchemaType["sort"];
    sortOrder: BooksSchemaType["sortOrder"];
}

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
