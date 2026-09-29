import type { CartItemSchemaType } from "../validation/cartItem.schema";

interface cartItemSortFuncArgs {
    sort: CartItemSchemaType["sort"];
    sortOrder: CartItemSchemaType["sortOrder"];
}

/**
 * cartItemSortFunc builds the Prisma orderBy object for the cart items list query.
 * @param sortArgs - The requested sort field and direction.
 * @returns A Prisma orderBy object (defaults to ascending cartItemId).
 */
const cartItemSortFunc = ({ sort = "cartItemId", sortOrder = "asc" }: cartItemSortFuncArgs) => {
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

export default cartItemSortFunc;
