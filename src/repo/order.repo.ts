import type { Order } from "../generated/prisma/browser";
import { prisma } from "../libs/prisma";
import orderSortFunc from "../utils/orderSort";
import type { OrderSchemaType, UpdateOrderBodySchemaType } from "../validation/order.schema";

// The outcome of a checkout attempt: either the created order, or the reason it
// could not be created. The service turns the error cases into AppErrors, so
// the repository never throws a business error itself.
type CreateOrderResult =
    | { error?: undefined; order: Order }
    | { error: "cart_not_found" }
    | { error: "empty_cart" }
    | { error: "out_of_stock"; outOfStock: Array<{ bookId: number; title: string; stockCount: number }> };

/**
 * createOrder turns the cart of a user into an order inside a single
 * interactive transaction, so the checkout either happens completely or not at
 * all. Nothing the client sends is trusted except the address: the items, the
 * quantities and the unit prices are re-read from the database inside the
 * transaction.
 *
 * Flow (all inside prisma.$transaction):
 *  1. Load the cart of the user with its items and their books.
 *  2. Bail out with "cart_not_found" when the user has no cart.
 *  3. Bail out with "empty_cart" when the cart holds no items.
 *  4. Bail out with "out_of_stock" when any item asks for more than the stock of
 *     its book, so nothing is written when one line is not deliverable.
 *  5. Create the order with the totals computed from the current book prices.
 *  6. Create one order item per cart item, at the current book price.
 *  7. Decrement the stock of every book.
 *  8. Empty the cart: delete its items and reset its totals.
 *  9. Return the created order.
 *
 * @param userId - The id of the authenticated user placing the order.
 * @param address - The delivery address sent by the client.
 * @returns A Promise resolving to the created order, or to the reason the order could not be created.
 */
const createOrder = async (userId: string, address: string): Promise<CreateOrderResult> => {
    return await prisma.$transaction(async tx => {
        const cart = await tx.cart.findUnique({
            where: { userId },
            include: {
                cartItems: {
                    include: { book: true },
                },
            },
        });

        if (!cart) return { error: "cart_not_found" };

        if (cart.cartItems.length === 0) return { error: "empty_cart" };

        const outOfStock = cart.cartItems
            .filter(cartItem => cartItem.quantity > cartItem.book.stockCount)
            .map(cartItem => ({
                bookId: cartItem.book.bookId,
                title: cartItem.book.title,
                stockCount: cartItem.book.stockCount,
            }));

        if (outOfStock.length > 0) return { error: "out_of_stock", outOfStock };

        // The unit price of every line is the current price of the book, never
        // the price that was cached in the cart item.
        const quantity = cart.cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0);
        const price = cart.cartItems.reduce(
            (total, cartItem) => total + cartItem.quantity * cartItem.book.price,
            0,
        );

        const order = await tx.order.create({
            data: { userId, address, quantity, price },
        });

        await tx.orderItem.createMany({
            data: cart.cartItems.map(cartItem => ({
                orderId: order.orderId,
                bookId: cartItem.bookId,
                quantity: cartItem.quantity,
                price: cartItem.book.price,
            })),
        });

        for (const cartItem of cart.cartItems) {
            await tx.book.update({
                where: { bookId: cartItem.bookId },
                data: { stockCount: { decrement: cartItem.quantity } },
            });
        }

        await tx.cartItem.deleteMany({ where: { cartId: cart.cartId } });

        await tx.cart.update({
            where: { cartId: cart.cartId },
            data: { quantity: 0, price: 0 },
        });

        return { order };
    });
};

/**
 * getAllOrders fetches every order from the database, applying the requested
 * sort and limit.
 * @param query - The sort/pagination query.
 * @returns A Promise resolving to the matching orders.
 */
const getAllOrders = async (query: OrderSchemaType) => {
    const { sort, sortOrder, limit } = query;

    return await prisma.order.findMany({
        orderBy: orderSortFunc({ sort, sortOrder }),
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

export { createOrder, deleteOrder, getAllOrders, getOrderByItsId, updateOrder };

export type { CreateOrderResult };
