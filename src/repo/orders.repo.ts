import { prisma } from "../libs/prisma";
import ordersSortFunc from "../utils/ordersSort";
import type { OrdersSchemaType, UpdateOrderBodySchemaType } from "../validation/orders.schema";

/**
 * getAllOrders fetches every order from the database, applying the requested
 * sort and limit.
 * @param query - The sort/pagination query.
 * @returns A Promise resolving to the matching orders.
 */
const getAllOrders = async (query: OrdersSchemaType) => {
    const { sort, sortOrder, limit } = query;

    return await prisma.order.findMany({
        orderBy: ordersSortFunc({ sort, sortOrder }),
        ...(limit !== undefined && { take: limit }),
    });
};

/**
 * getOrderByItsId fetches a single order by its id, with the items it holds.
 * @param orderId - The id of the order to retrieve.
 * @returns A Promise resolving to the order (with its items) or null.
 */
const getOrderByItsId = async (orderId: string) => {
    return await prisma.order.findUnique({
        where: { orderId },
        include: { orderItems: true },
    });
};

/**
 * updateOrder persists the new delivery address of an order.
 * @param orderId - The id of the order to update.
 * @param order - The validated body holding the new address.
 * @returns A Promise resolving to the updated order.
 */
const updateOrder = async (orderId: string, order: UpdateOrderBodySchemaType) => {
    const { address } = order;

    return await prisma.order.update({
        where: { orderId },
        data: { address },
    });
};

/**
 * deleteOrder removes an order and its items from the database. The items are
 * deleted first inside a transaction, because OrderItem rows point at the order
 * and the schema has no cascade delete on that relation.
 * @param orderId - The id of the order to delete.
 * @returns A Promise that resolves once the order and its items are deleted.
 */
const deleteOrder = async (orderId: string): Promise<void> => {
    await prisma.$transaction([
        prisma.orderItem.deleteMany({ where: { orderId } }),
        prisma.order.delete({ where: { orderId } }),
    ]);
};

export { deleteOrder, getAllOrders, getOrderByItsId, updateOrder };
