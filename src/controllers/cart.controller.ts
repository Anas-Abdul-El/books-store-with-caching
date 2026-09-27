import type { NextFunction, Request, Response } from "express";
import { cartService } from "../services";
import type { CartWithItems } from "../services/cart.services";

/**
 * getCartByUserId sends the cart of the logged in user, with its items and the
 * book behind every item, to the client.
 * The user id is the one the authHandler middleware read from the access token,
 * so a user can never ask for somebody else's cart.
 * @param req - The Express request; expects the user id set by the authHandler.
 * @param res - The Express response typed with the cart and its items.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the cart is sent.
 */
const getCartByUserId = async (req: Request, res: Response<CartWithItems>, next: NextFunction) => {
    const { userId } = req;

    const cart = await cartService.getCartByUserId(userId);

    res.send(cart);
};

export default { getCartByUserId };
