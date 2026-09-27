import { prisma } from "../libs/prisma";

/**
 * getCartByUserId fetches the cart of a single user, together with its items and
 * the book behind every item, so the client gets the whole basket in one call.
 * The userId comes from the access token, never from the request, so a user can
 * only ever read their own cart.
 * @param userId - The id of the authenticated owner of the cart.
 * @returns A Promise resolving to the cart (with its items and books) or null.
 */
const getCartByUserId = async (userId: string) => {
    return await prisma.cart.findUnique({
        where: { userId },
        include: {
            cartItems: {
                include: {
                    book: true,
                },
            },
        },
    });
};

export { getCartByUserId };
