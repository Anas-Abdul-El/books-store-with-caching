interface BookRouterRequestQuery {
    id: string;
}

interface BookCacheKey {
    filter: string;
    sort: string;
    limit: number;
}

export type { BookCacheKey, BookRouterRequestQuery };
