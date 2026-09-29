import type { BookCacheKey } from "../types/book";

/**
 * createBooksCacheKey builds a deterministic Redis key from the books query, so
 * two identical requests share the same cached entry.
 * @param query - The filter/sort/pagination query used to list books.
 * @returns The Redis cache key string.
 */
const createBooksCacheKey = ({ filter, sort, limit }: BookCacheKey): string =>
    ["books", `filter=${filter}`, `sort=${sort}`, `limit=${limit}`].join(":");

export default createBooksCacheKey;
