import type { CartItemsSchemaType } from "../validation/cartItems.schema";

/**
 * createCartItemsCacheKey builds a deterministic Redis key from the cart items
 * query so equal queries share the same cached entry.
 * @param query - The sort/pagination query used to list cart items.
 * @returns The Redis cache key string.
 */
const createCartItemsCacheKey = ({ sort, sortOrder, limit }: CartItemsSchemaType): string =>
    ["cartItems", `sort=${sort}`, `sortOrder=${sortOrder}`, `limit=${limit}`].join(":");

export default createCartItemsCacheKey;
