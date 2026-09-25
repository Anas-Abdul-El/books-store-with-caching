import type { CategoriesSchemaType } from "../validation/category.schema";

interface categorySortFuncArgs {
    sort: CategoriesSchemaType["sort"];
    sortOrder: CategoriesSchemaType["sortOrder"];
}

/**
 * categorySortFunc builds the Prisma orderBy object for the categories list query.
 * @param sortArgs - The requested sort field and direction.
 * @returns A Prisma orderBy object (defaults to ascending name).
 */
const categorySortFunc = ({ sort = "name", sortOrder = "asc" }: categorySortFuncArgs) => {
    switch (sort) {
        case "name":
            return {
                name: sortOrder,
            };
        case "categoryId":
            return {
                categoryId: sortOrder,
            };
        default:
            return {
                name: sortOrder,
            };
    }
};

export default categorySortFunc;