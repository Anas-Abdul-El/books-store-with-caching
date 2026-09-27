import type { CartItemsSchemaType } from "../validation/cartItems.schema";

interface cartItemsSortFuncArgs {
    sort: CartItemsSchemaType["sort"];
    sortOrder: CartItemsSchemaType["sortOrder"];
}

/**
 * cartItemsSortFunc builds the Prisma orderBy object for the cart items list query.
 * @param sortArgs - The requested sort field and direction.
 * @returns A Prisma orderBy object (defaults to ascending cartItemId).
 */
const cartItemsSortFunc = ({ sort = "cartItemId", sortOrder = "asc" }: cartItemsSortFuncArgs) => {
    switch (sort) {
        case "price":
            return {
                price: sortOrder,
            };
        case "quantity":
            return {
                quantity: sortOrder,
            };
        case "cartItemId":
            return {
                cartItemId: sortOrder,
            };
        default:
            return {
                cartItemId: sortOrder,
            };
    }
};

export default cartItemsSortFunc;
