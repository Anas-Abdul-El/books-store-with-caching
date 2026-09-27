import type { CartItem } from "../generated/prisma/browser";
import { connectRedis } from "../libs/redis";
import { cartItemsRepo } from "../repo";
import AppError from "../utils/AppErr";
import createCartItemsCacheKey from "../utils/cartItemsCacheKey";
import type { CartItemsSchemaType } from "../validation/cartItems.schema";

// A cached cart item stays in Redis for 1.5 hour (60 * 90 seconds) after being cached.
const CART_ITEMS_CACHE_TTL_SECONDS = 60 * 90;

/**
 * getAllCartItems retrieves all cart items matching the given query, using a
 * Redis string key (built from the query via createCartItemsCacheKey) as a cache
 * in front of the database so repeated identical requests avoid hitting PostgreSQL.
 *
 * Flow:
 *  1. Ensure the Redis client is connected.
 *  2. Build a deterministic cache key from the query.
 *  3. Try to read the cached JSON string (cache hit path).
 *  4. On a hit, parse the stored JSON string back into cart items and return them.
 *  5. On a miss, fetch the cart items from the DB with cartItemsRepo.getAllCartItems.
 *  6. If no cart items match the query, throw a 204 AppError.
 *  7. Otherwise cache the result as a JSON string with a TTL, then return it.
 *
 * @param cartItemQuery - The sort/pagination query used to select the cart items.
 * @returns A Promise resolving to the matching cart items (from cache or database).
 * @throws {AppError} With a 204 status when no cart items are found.
 */
const getAllCartItems = async (cartItemQuery: CartItemsSchemaType): Promise<Array<CartItem>> => {
    const redis = await connectRedis();

    const cachedCartItemsKey = createCartItemsCacheKey(cartItemQuery);

    const cachedCartItems = await redis.get(cachedCartItemsKey);

    if (cachedCartItems) return JSON.parse(cachedCartItems);

    const cartItems = await cartItemsRepo.getAllCartItems(cartItemQuery);

    if (!cartItems) throw new AppError("Empty", 204);

    await redis.set(cachedCartItemsKey, JSON.stringify(cartItems), { EX: CART_ITEMS_CACHE_TTL_SECONDS });

    return cartItems;
};

export { getAllCartItems };
