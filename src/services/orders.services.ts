import type { Order } from "../generated/prisma/browser";
import { connectRedis } from "../libs/redis";
import { ordersRepo } from "../repo";
import AppError from "../utils/AppErr";
import { createCartCacheKey } from "../utils/cartCacheKey";
import { CART_ITEMS_CACHE_PATTERN } from "../utils/cartItemsCacheKey";
import clearCacheByPattern, { clearCacheByKey } from "../utils/clearCache";
import { ORDERS_CACHE_PATTERN, createOrdersCacheKey } from "../utils/ordersCacheKey";
import type { AddOrderSchemaType, OrdersSchemaType, UpdateOrderBodySchemaType } from "../validation/orders.schema";

// A cached order stays in Redis for 1.5 hour (60 * 90 seconds) after being cached.
const ORDERS_CACHE_TTL_SECONDS = 60 * 90;

/**
 * getAllOrders retrieves all orders matching the given query, using a Redis
 * string key (built from the query via createOrdersCacheKey) as a cache in front
 * of the database so repeated identical requests avoid hitting PostgreSQL.
 * This listing is private, it is only reachable by an admin through
 * authHandler("private"), and it is never scoped to a single user.
 *
 * Flow:
 *  1. Ensure the Redis client is connected.
 *  2. Build a deterministic cache key from the query.
 *  3. Try to read the cached JSON string (cache hit path).
 *  4. On a hit, parse the stored JSON string back into orders and return them.
 *  5. On a miss, fetch the orders from the DB with ordersRepo.getAllOrders.
 *  6. If no orders match the query, throw a 204 AppError.
 *  7. Otherwise cache the result as a JSON string with a TTL, then return it.
 *
 * @param orderQuery - The sort/pagination query used to select the orders.
 * @returns A Promise resolving to the matching orders (from cache or database).
 * @throws {AppError} With a 204 status when no orders are found.
 */
const getAllOrders = async (orderQuery: OrdersSchemaType): Promise<Array<Order>> => {
    const redis = await connectRedis();

    const cachedOrdersKey = createOrdersCacheKey(orderQuery);

    const cachedOrders = await redis.get(cachedOrdersKey);

    if (cachedOrders) return JSON.parse(cachedOrders);

    const orders = await ordersRepo.getAllOrders(orderQuery);

    if (!orders) throw new AppError("Empty", 204);

    await redis.set(cachedOrdersKey, JSON.stringify(orders), { EX: ORDERS_CACHE_TTL_SECONDS });

    return orders;
};

/**
 * updateOrder updates the delivery address of an existing order, then drops the
 * cached orders list so the next read is served from the database.
 * This route is private, it is only reachable by an admin through
 * authHandler("private").
 *
 * Flow:
 *  1. Verify the order exists via ordersRepo.getOrderByItsId.
 *  2. If it does not exist, throw a 404 AppError.
 *  3. Otherwise apply the new address via ordersRepo.updateOrder.
 *  4. Clear every "orders:*" Redis key, since the cached list is now stale.
 *  5. Return the updated order.
 *
 * @param orderId - The id of the order to update.
 * @param order - The validated body holding the new address.
 * @returns A Promise resolving to the updated order.
 * @throws {AppError} With a 404 status when the order is not found.
 */
const updateOrder = async (orderId: string, order: UpdateOrderBodySchemaType): Promise<Order> => {
    const selectedOrder = await ordersRepo.getOrderByItsId(orderId);

    if (!selectedOrder) throw new AppError("Order not found", 404);

    const updatedOrder = await ordersRepo.updateOrder(orderId, order);

    await clearCacheByPattern(ORDERS_CACHE_PATTERN);

    return updatedOrder;
};

/**
 * deleteOrder removes an existing order with its items, then drops the cached
 * orders list so the next read is served from the database.
 * This route is private, it is only reachable by an admin through
 * authHandler("private").
 *
 * Flow:
 *  1. Verify the order exists via ordersRepo.getOrderByItsId.
 *  2. If it does not exist, throw a 404 AppError.
 *  3. Otherwise delete it, together with its items, via ordersRepo.deleteOrder.
 *  4. Clear every "orders:*" Redis key, since the cached list is now stale.
 *
 * @param orderId - The id of the order to delete.
 * @returns A Promise that resolves once the order is deleted.
 * @throws {AppError} With a 404 status when the order is not found.
 */
const deleteOrder = async (orderId: string): Promise<void> => {
    const selectedOrder = await ordersRepo.getOrderByItsId(orderId);

    if (!selectedOrder) throw new AppError("Order not found", 404);

    await ordersRepo.deleteOrder(orderId);

    await clearCacheByPattern(ORDERS_CACHE_PATTERN);
};

/**
 * addOrder places an order for the logged in user out of their own cart.
 * The whole checkout runs in one Prisma transaction, so an order is never
 * created without its items, the stock is never decremented twice and the cart
 * is only emptied once the order exists.
 *
 * Flow:
 *  1. Call ordersRepo.createOrder, which re-reads the cart, checks the stock,
 *     creates the order with its items, decrements the stock and empties the
 *     cart inside a single transaction.
 *  2. Translate the failure cases of the repository into AppErrors: 404 when the
 *     user has no cart, 400 when the cart is empty, and 400 listing the books
 *     that do not have enough stock.
 *  3. Drop the cached orders list, the cached cart items and the cached cart of
 *     the user, since all three changed.
 *  4. Return the created order.
 *
 * @param userId - The id of the authenticated user placing the order.
 * @param order - The validated body holding the delivery address.
 * @returns A Promise resolving to the created order.
 * @throws {AppError} With a 404 status when the user has no cart, or 400 when the cart is empty or the stock is not enough.
 */
const addOrder = async (userId: string, order: AddOrderSchemaType): Promise<Order> => {
    const { address } = order;

    const result = await ordersRepo.createOrder(userId, address);

    if (result.error === "cart_not_found") throw new AppError("Cart not found", 404);

    if (result.error === "empty_cart") throw new AppError("Your cart is empty", 400);

    if (result.error === "out_of_stock")
        throw new AppError(
            `Not enough stock for: ${result.outOfStock.map(book => `${book.title} (${book.stockCount} left)`).join(", ")}`,
            400,
        );

    await clearCacheByPattern(ORDERS_CACHE_PATTERN);
    await clearCacheByPattern(CART_ITEMS_CACHE_PATTERN);
    await clearCacheByKey(createCartCacheKey(userId));

    return result.order;
};

export { addOrder, deleteOrder, getAllOrders, updateOrder };
