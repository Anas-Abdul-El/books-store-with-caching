import type { OrderSchemaType } from "../validation/order.schema";

// Every orders cache key starts with this prefix, so the whole namespace can be
// found (and dropped) with a single Redis pattern scan.
const ORDER_CACHE_PREFIX = "orders";

/**
 * createOrderCacheKey builds a deterministic Redis key from the orders query so
 * equal queries share the same cached entry.
 * @param query - The sort/pagination query used to list orders.
 * @returns The Redis cache key string.
 */
const createOrderCacheKey = ({ sort, sortOrder, limit }: OrderSchemaType): string =>
    [ORDER_CACHE_PREFIX, `sort=${sort}`, `sortOrder=${sortOrder}`, `limit=${limit}`].join(":");

/**
 * The Redis pattern matching every orders cache key.
 */
const ORDER_CACHE_PATTERN = `${ORDER_CACHE_PREFIX}:*`;

export { ORDER_CACHE_PATTERN, ORDER_CACHE_PREFIX, createOrderCacheKey };

export default createOrderCacheKey;
