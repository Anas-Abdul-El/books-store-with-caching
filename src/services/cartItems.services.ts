import type { CartItem } from "../generated/prisma/browser";
import { connectRedis } from "../libs/redis";
import { cartItemsRepo } from "../repo";
import AppError from "../utils/AppErr";
import { CART_ITEMS_CACHE_PATTERN, createCartItemsCacheKey } from "../utils/cartItemsCacheKey";
import clearCacheByPattern from "../utils/clearCache";
import type { CartItemsSchemaType, UpdateCartItemsBodySchemaType } from "../validation/cartItems.schema";

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

/**
 * updateCartItem updates the quantity of a cart item that belongs to the
 * authenticated user, then drops the cached cart items list so the next read is
 * served from the database.
 *
 * Flow:
 *  1. Load the cart item with its book through cartItemsRepo.getCartItemByItsId,
 *     scoped to the user id set by the authHandler middleware.
 *  2. If the item does not exist inside that user's cart, throw a 404 AppError,
 *     so a cart item of another user is indistinguishable from a missing one.
 *  3. Reject a quantity larger than the stock of the book with a 400 AppError.
 *  4. Persist the new quantity and the price re-read from the book, so the unit
 *     price can never be tampered with by the client.
 *  5. Clear every "cartItems:*" Redis key, since the cached list is now stale.
 *  6. Return the updated cart item.
 *
 * @param cartItemId - The id of the cart item to update.
 * @param userId - The id of the authenticated owner of the cart.
 * @param cartItem - The validated body holding the new quantity.
 * @returns A Promise resolving to the updated cart item.
 * @throws {AppError} With a 404 status when the item is not in the user's cart, or 400 when the stock is exceeded.
 */
const updateCartItem = async (
    cartItemId: string,
    userId: string,
    cartItem: UpdateCartItemsBodySchemaType,
): Promise<CartItem> => {
    const { quantity } = cartItem;

    const selectedCartItem = await cartItemsRepo.getCartItemByItsId(cartItemId, userId);

    if (!selectedCartItem) throw new AppError("Cart item not found", 404);

    if (quantity > selectedCartItem.book.stockCount)
        throw new AppError(`Only ${selectedCartItem.book.stockCount} left in stock`, 400);

    const updatedCartItem = await cartItemsRepo.updateCartItem(cartItemId, {
        quantity,
        price: selectedCartItem.book.price,
    });

    await clearCacheByPattern(CART_ITEMS_CACHE_PATTERN);

    return updatedCartItem;
};

/**
 * deleteCartItem removes a cart item that belongs to the authenticated user,
 * then drops the cached cart items list so the next read is served from the
 * database.
 *
 * Flow:
 *  1. Load the cart item through cartItemsRepo.getCartItemByItsId, scoped to the
 *     user id set by the authHandler middleware.
 *  2. If the item does not exist inside that user's cart, throw a 404 AppError,
 *     so a cart item of another user is indistinguishable from a missing one.
 *  3. Delete it via cartItemsRepo.deleteCartItem.
 *  4. Clear every "cartItems:*" Redis key, since the cached list is now stale.
 *
 * @param cartItemId - The id of the cart item to delete.
 * @param userId - The id of the authenticated owner of the cart.
 * @returns A Promise that resolves once the cart item is deleted.
 * @throws {AppError} With a 404 status when the item is not in the user's cart.
 */
const deleteCartItem = async (cartItemId: string, userId: string): Promise<void> => {
    const selectedCartItem = await cartItemsRepo.getCartItemByItsId(cartItemId, userId);

    if (!selectedCartItem) throw new AppError("Cart item not found", 404);

    await cartItemsRepo.deleteCartItem(cartItemId);

    await clearCacheByPattern(CART_ITEMS_CACHE_PATTERN);
};

export { deleteCartItem, getAllCartItems, updateCartItem };
