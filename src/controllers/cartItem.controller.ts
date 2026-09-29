import type { NextFunction, Request, Response } from "express";
import type { CartItem } from "../generated/prisma/browser";
import { cartItemService } from "../services";
import type {
    CartItemSchemaType,
    DeleteCartItemSchemaType,
    UpdateCartItemBodySchemaType,
    UpdateCartItemParamsSchemaType,
} from "../validation/cartItem.schema";

/**
 * getAllCartItems fetches all cart items matching the query (sort/pagination)
 * and sends them to the client.
 * @param req - The Express request; expects the query params.
 * @param res - The Express response typed as {@link Response}<Array<{@link CartItem}>>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the cart items are sent.
 */
const getAllCartItems = async (
    req: Request<{}, {}, {}, CartItemSchemaType>,
    res: Response<Array<CartItem>>,
    next: NextFunction,
) => {
    const cartItemQuery = req.query;

    const cartItems = await cartItemService.getAllCartItems(cartItemQuery);

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
    req: Request<UpdateCartItemParamsSchemaType, {}, UpdateCartItemBodySchemaType, {}>,
    res: Response<CartItem>,
    next: NextFunction,
) => {
    const {
        userId,
        params: { cartItemId },
        body: { quantity },
    } = req;

    const updatedCartItem = await cartItemService.updateCartItem(cartItemId, userId, { quantity });

    res.send(updatedCartItem);
};

/**
 * deleteCartItem deletes a cart item of the logged in user and sends a
 * confirmation message.
 * @param req - The Express request; expects the cart item id in the route params
 * and the user id set by the authHandler.
 * @param res - The Express response that sends the confirmation message.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the cart item is deleted.
 */
const deleteCartItem = async (
    req: Request<DeleteCartItemSchemaType, {}, {}, {}>,
    res: Response<string>,
    next: NextFunction,
) => {
    const {
        userId,
        params: { cartItemId },
    } = req;

    await cartItemService.deleteCartItem(cartItemId, userId);

    res.send("the cart item deleted succ");
};

export default { deleteCartItem, getAllCartItems, updateCartItem };
