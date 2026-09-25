import type { AuthorsSchemaType } from "../validation/author.schema";

interface authorSortFuncArgs {
    sort: AuthorsSchemaType["sort"];
    sortOrder: AuthorsSchemaType["sortOrder"];
}

/**
 * authorSortFunc builds the Prisma orderBy object for the authors list query.
 * @param sortArgs - The requested sort field and direction.
 * @returns A Prisma orderBy object (defaults to ascending name).
 */
const authorSortFunc = ({ sort = "name", sortOrder = "asc" }: authorSortFuncArgs) => {
    switch (sort) {
        case "name":
            return {
                name: sortOrder,
            };
        case "authorId":
            return {
                authorId: sortOrder,
            };
        default:
            return {
                name: sortOrder,
            };
    }
};

export default authorSortFunc;