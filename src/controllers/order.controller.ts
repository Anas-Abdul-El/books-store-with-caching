import type { NextFunction, Request, Response } from "express";
import type { Order } from "../generated/prisma/browser";
import { orderService } from "../services";
import type {
    CreateOrderSchemaType,
    DeleteOrderSchemaType,
    OrderSchemaType,
    UpdateOrderBodySchemaType,
    UpdateOrderParamsSchemaType,
} from "../validation/order.schema";

/**
 * getAllOrders fetches all orders matching the query (sort/pagination) and sends
 * them to the client. The route behind it is private, so only an admin ever
 * reaches this controller.
 * @param req - The Express request; expects the query params.
 * @param res - The Express response typed as {@link Response}<Array<{@link Order}>>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the orders are sent.
 */
const getAllOrders = async (
    req: Request<{}, {}, {}, OrderSchemaType>,
    res: Response<Array<Order>>,
    next: NextFunction,
) => {
    const orderQuery = req.query;

    const orders = await orderService.getAllOrders(orderQuery);

    res.send(orders);
};

/**
 * createOrder places an order for the logged in user out of their own cart and
 * sends the created order back. The items and the prices are taken from the
 * cart inside the transaction, the client only chooses the delivery address.
 * @param req - The Express request; expects the address in the body and the
 * user id set by the authHandler.
 * @param res - The Express response typed as {@link Response}<{@link Order}>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the created order is sent.
 */
const createOrder = async (
    req: Request<{}, {}, CreateOrderSchemaType, {}>,
    res: Response<Order>,
    next: NextFunction,
) => {
    const {
        userId,
        body: { address },
    } = req;

    const createdOrder = await orderService.createOrder(userId, { address });

    res.status(201).send(createdOrder);
};

/**
 * updateOrder updates the delivery address of an order and sends the updated
 * order back. The route behind it is private, so only an admin ever reaches
 * this controller.
 * @param req - The Express request; expects the order id in the route params and
 * the new address in the body.
 * @param res - The Express response typed as {@link Response}<{@link Order}>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the updated order is sent.
 */
const updateOrder = async (
    req: Request<UpdateOrderParamsSchemaType, {}, UpdateOrderBodySchemaType, {}>,
    res: Response<Order>,
    next: NextFunction,
) => {
    const {
        params: { orderId },
        body,
    } = req;

    const updatedOrder = await orderService.updateOrder(orderId, body);

    res.send(updatedOrder);
};

/**
 * deleteOrder deletes an order with its items and sends a confirmation message.
 * The route behind it is private, so only an admin ever reaches this controller.
 * @param req - The Express request; expects the order id in the route params.
 * @param res - The Express response that sends the confirmation message.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the order is deleted.
 */
const deleteOrder = async (
    req: Request<DeleteOrderSchemaType, {}, {}, {}>,
    res: Response<string>,
    next: NextFunction,
) => {
    const {
        params: { orderId },
    } = req;

    await orderService.deleteOrder(orderId);

    res.send("the order deleted succ");
};

export default { createOrder, deleteOrder, getAllOrders, updateOrder };
