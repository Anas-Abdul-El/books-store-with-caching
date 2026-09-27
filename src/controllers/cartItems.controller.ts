import type { NextFunction, Request, Response } from "express";
import type { CartItem } from "../generated/prisma/browser";
import { cartItemsService } from "../services";
import type { CartItemsSchemaType } from "../validation/cartItems.schema";

/**
 * getAllCartItems fetches all cart items matching the query (sort/pagination)
 * and sends them to the client.
 * @param req - The Express request; expects the query params.
 * @param res - The Express response typed as {@link Response}<Array<{@link CartItem}>>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the cart items are sent.
 */
const getAllCartItems = async (
    req: Request<{}, {}, {}, CartItemsSchemaType>,
    res: Response<Array<CartItem>>,
    next: NextFunction,
) => {
    const cartItemQuery = req.query;

    const cartItems = await cartItemsService.getAllCartItems(cartItemQuery);

    res.send(cartItems);
};

export default { getAllCartItems };
