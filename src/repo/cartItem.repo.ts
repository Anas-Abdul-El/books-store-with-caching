import { prisma } from "../libs/prisma";
import cartItemSortFunc from "../utils/cartItemSort";
import type { CartItemSchemaType, UpdateCartItemBodySchemaType } from "../validation/cartItem.schema";

/**
 * getAllCartItems fetches every cart item from the database, applying the
 * requested sort and limit.
 * @param query - The sort/pagination query.
 * @returns A Promise resolving to the matching cart items.
 */
const getAllCartItems = async (query: CartItemSchemaType) => {
    const { sort, sortOrder, limit } = query;

    return await prisma.cartItem.findMany({
        orderBy: cartItemSortFunc({ sort, sortOrder }),
        ...(limit !== undefined && { take: limit }),
    });
};

/**
 * getCartItemByItsId fetches a single cart item with its book, scoped to the
 * cart of the given user, so a user can never read or change an item that
 * belongs to somebody else.
 * @param cartItemId - The id of the cart item to retrieve.
 * @param userId - The id of the authenticated owner of the cart.
 * @returns A Promise resolving to the cart item (with its book) or null.
 */
const getCartItemByItsId = async (cartItemId: string, userId: string) => {
    return await prisma.cartItem.findFirst({
        where: { cartItemId, cart: { userId } },
        include: { book: true },
    });
};

/**
 * updateCartItem persists the new quantity and unit price of a cart item.
 * @param cartItemId - The id of the cart item to update.
 * @param cartItem - The new quantity together with the price re-read from the book.
 * @returns A Promise resolving to the updated cart item.
 */
const updateCartItem = async (cartItemId: string, cartItem: UpdateCartItemBodySchemaType & { price: number }) => {
    const { quantity, price } = cartItem;

    return await prisma.cartItem.update({
        where: { cartItemId },
        data: { quantity, price },
    });
};

/**
 * deleteCartItem removes a cart item from the database by its id.
 * @param cartItemId - The id of the cart item to delete.
 * @returns A Promise that resolves once the cart item is deleted.
 */
const deleteCartItem = async (cartItemId: string): Promise<void> => {
    await prisma.cartItem.delete({
        where: { cartItemId },
    });
};

export { deleteCartItem, getAllCartItems, getCartItemByItsId, updateCartItem };
