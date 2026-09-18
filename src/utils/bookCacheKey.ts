import type { BookCacheKey } from "../types/book";

const createBooksCacheKey = ({ filter, sort, limit }: BookCacheKey): string =>
    ["books", `filter=${filter}`, `sort=${sort}`, `limit=${limit}`].join(":");

export default createBooksCacheKey;
