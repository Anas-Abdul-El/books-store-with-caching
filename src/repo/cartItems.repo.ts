import { prisma } from "../libs/prisma";
import cartItemsSortFunc from "../utils/cartItemsSort";
import type { CartItemsSchemaType } from "../validation/cartItems.schema";

/**
 * getAllCartItems fetches every cart item from the database, applying the
 * requested sort and limit.
 * @param query - The sort/pagination query.
 * @returns A Promise resolving to the matching cart items.
 */
const getAllCartItems = async (query: CartItemsSchemaType) => {
    const { sort, sortOrder, limit } = query;

    return await prisma.cartItem.findMany({
        orderBy: cartItemsSortFunc({ sort, sortOrder }),
        ...(limit !== undefined && { take: limit }),
    });
};

export { getAllCartItems };
