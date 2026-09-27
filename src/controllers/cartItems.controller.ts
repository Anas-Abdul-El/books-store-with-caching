import type { NextFunction, Request, Response } from "express";
import type { CartItem } from "../generated/prisma/browser";
import { cartItemsService } from "../services";
import type {
    CartItemsSchemaType,
    UpdateCartItemsBodySchemaType,
    UpdateCartItemsParamsSchemaType,
} from "../validation/cartItems.schema";

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

/**
 * updateCartItem updates the quantity of a cart item of the logged in user and
 * sends the updated cart item back.
 * @param req - The Express request; expects the cart item id in the route params
 * and the new quantity in the body, plus the user id set by the authHandler.
 * @param res - The Express response typed as {@link Response}<{@link CartItem}>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the updated cart item is sent.
 */
const updateCartItem = async (
    req: Request<UpdateCartItemsParamsSchemaType, {}, UpdateCartItemsBodySchemaType, {}>,
    res: Response<CartItem>,
    next: NextFunction,
) => {
    const {
        userId,
        params: { cartItemId },
        body: { quantity },
    } = req;

    const updatedCartItem = await cartItemsService.updateCartItem(cartItemId, userId, { quantity });

    res.send(updatedCartItem);
};

export default { getAllCartItems, updateCartItem };
