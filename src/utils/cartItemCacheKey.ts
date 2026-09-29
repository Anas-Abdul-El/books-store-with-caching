import type { CartItemSchemaType } from "../validation/cartItem.schema";

// Every cart item cache key starts with this prefix, so the whole namespace
// can be found (and dropped) with a single Redis pattern scan.
const CART_ITEM_CACHE_PREFIX = "cartItems";

/**
 * createCartItemCacheKey builds a deterministic Redis key from the cart items
 * query so equal queries share the same cached entry.
 * @param query - The sort/pagination query used to list cart items.
 * @returns The Redis cache key string.
 */
const createCartItemCacheKey = ({ sort, sortOrder, limit }: CartItemSchemaType): string =>
    [CART_ITEM_CACHE_PREFIX, `sort=${sort}`, `sortOrder=${sortOrder}`, `limit=${limit}`].join(":");

/**
 * The Redis pattern matching every cart item cache key.
 */
const CART_ITEM_CACHE_PATTERN = `${CART_ITEM_CACHE_PREFIX}:*`;

export { CART_ITEM_CACHE_PATTERN, CART_ITEM_CACHE_PREFIX, createCartItemCacheKey };

export default createCartItemCacheKey;
