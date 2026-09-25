import type { CategoriesSchemaType } from "../validation/category.schema";

/**
 * createCategoriesCacheKey builds a deterministic Redis key from the categories
 * query so equal queries share the same cached entry.
 * @param query - The sort/pagination query used to list categories.
 * @returns The Redis cache key string.
 */
const createCategoriesCacheKey = ({ sort, sortOrder, limit }: CategoriesSchemaType): string =>
    ["categories", `sort=${sort}`, `sortOrder=${sortOrder}`, `limit=${limit}`].join(":");

export default createCategoriesCacheKey;