import type { CartItemsSchemaType } from "../validation/cartItems.schema";

// Every cart items cache key starts with this prefix, so the whole namespace
// can be found (and dropped) with a single Redis pattern scan.
const CART_ITEMS_CACHE_PREFIX = "cartItems";

/**
 * createCartItemsCacheKey builds a deterministic Redis key from the cart items
 * query so equal queries share the same cached entry.
 * @param query - The sort/pagination query used to list cart items.
 * @returns The Redis cache key string.
 */
const createCartItemsCacheKey = ({ sort, sortOrder, limit }: CartItemsSchemaType): string =>
    [CART_ITEMS_CACHE_PREFIX, `sort=${sort}`, `sortOrder=${sortOrder}`, `limit=${limit}`].join(":");

/**
 * The Redis pattern matching every cart items cache key.
 */
const CART_ITEMS_CACHE_PATTERN = `${CART_ITEMS_CACHE_PREFIX}:*`;

export { CART_ITEMS_CACHE_PATTERN, CART_ITEMS_CACHE_PREFIX, createCartItemsCacheKey };

export default createCartItemsCacheKey;
