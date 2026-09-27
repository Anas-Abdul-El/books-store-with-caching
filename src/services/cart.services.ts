import type { Prisma } from "../generated/prisma/browser";
import { connectRedis } from "../libs/redis";
import { cartRepo } from "../repo";
import AppError from "../utils/AppErr";
import { createCartCacheKey } from "../utils/cartCacheKey";

// A cached cart stays in Redis for 1.5 hour (60 * 90 seconds) after being cached.
const CART_CACHE_TTL_SECONDS = 60 * 90;

// The shape of the cart returned to the client: the cart row plus its items and
// the book behind every item.
type CartWithItems = Prisma.CartGetPayload<{
    include: { cartItems: { include: { book: true } } };
}>;

/**
 * getCartByUserId retrieves the cart of the authenticated user, using a Redis
 * string key (built from the user id via createCartCacheKey) as a cache in front
 * of the database so repeated reads of the same basket avoid hitting PostgreSQL.
 * The userId is never taken from the request, it is the id the authHandler
 * middleware read from the access token, so a user can only read their own cart.
 *
 * Flow:
 *  1. Ensure the Redis client is connected.
 *  2. Build the cache key of the user, "cart:<userId>".
 *  3. Try to read the cached JSON string (cache hit path).
 *  4. On a hit, parse the stored JSON string and return it — no DB query.
 *  5. On a miss, fetch the cart with its items from the DB with cartRepo.getCartByUserId.
 *  6. If the user has no cart, throw a 404 AppError.
 *  7. Otherwise cache the DB result as a JSON string with a TTL, then return it.
 *
 * @param userId - The id of the authenticated owner of the cart.
 * @returns A Promise resolving to the cart with its items (from cache or database).
 * @throws {AppError} With a 404 status when the user has no cart yet.
 */
const getCartByUserId = async (userId: string): Promise<CartWithItems> => {
    const redis = await connectRedis();

    const cartKey = createCartCacheKey(userId);

    const cachedCart = await redis.get(cartKey);

    if (cachedCart) {
        const parsedCart = JSON.parse(cachedCart) as CartWithItems;

        if (parsedCart.userId !== userId) {
            throw new AppError("Invalid cached cart data", 500);
        }

        return parsedCart;
    }

    const cart = await cartRepo.getCartByUserId(userId);

    if (!cart) throw new AppError("Cart not found", 404);

    await redis.set(cartKey, JSON.stringify(cart), { EX: CART_CACHE_TTL_SECONDS });

    return cart;
};

export type { CartWithItems };

export { getCartByUserId };
