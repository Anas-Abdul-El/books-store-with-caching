import type { OrdersSchemaType } from "../validation/orders.schema";

// Every orders cache key starts with this prefix, so the whole namespace can be
// found (and dropped) with a single Redis pattern scan.
const ORDERS_CACHE_PREFIX = "orders";

/**
 * createOrdersCacheKey builds a deterministic Redis key from the orders query so
 * equal queries share the same cached entry.
 * @param query - The sort/pagination query used to list orders.
 * @returns The Redis cache key string.
 */
const createOrdersCacheKey = ({ sort, sortOrder, limit }: OrdersSchemaType): string =>
    [ORDERS_CACHE_PREFIX, `sort=${sort}`, `sortOrder=${sortOrder}`, `limit=${limit}`].join(":");

/**
 * The Redis pattern matching every orders cache key.
 */
const ORDERS_CACHE_PATTERN = `${ORDERS_CACHE_PREFIX}:*`;

export { ORDERS_CACHE_PATTERN, ORDERS_CACHE_PREFIX, createOrdersCacheKey };

export default createOrdersCacheKey;
