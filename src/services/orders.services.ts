import type { Order } from "../generated/prisma/browser";
import { connectRedis } from "../libs/redis";
import { ordersRepo } from "../repo";
import AppError from "../utils/AppErr";
import clearCacheByPattern from "../utils/clearCache";
import { ORDERS_CACHE_PATTERN, createOrdersCacheKey } from "../utils/ordersCacheKey";
import type { OrdersSchemaType, UpdateOrderBodySchemaType } from "../validation/orders.schema";

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

export { deleteOrder, getAllOrders, updateOrder };
