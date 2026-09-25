import type { AuthorsSchemaType } from "../validation/author.schema";

/**
 * createAuthorsCacheKey builds a deterministic Redis key from the authors query
 * so equal queries share the same cached entry.
 * @param query - The sort/pagination query used to list authors.
 * @returns The Redis cache key string.
 */
const createAuthorsCacheKey = ({ sort, sortOrder, limit }: AuthorsSchemaType): string =>
    ["authors", `sort=${sort}`, `sortOrder=${sortOrder}`, `limit=${limit}`].join(":");

export default createAuthorsCacheKey;