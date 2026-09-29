import type { OrderSchemaType } from "../validation/order.schema";

interface orderSortFuncArgs {
    sort: OrderSchemaType["sort"];
    sortOrder: OrderSchemaType["sortOrder"];
}

/**
 * orderSortFunc builds the Prisma orderBy object for the orders list query.
 * @param sortArgs - The requested sort field and direction.
 * @returns A Prisma orderBy object (defaults to ascending orderId).
 */
const orderSortFunc = ({ sort = "orderId", sortOrder = "asc" }: orderSortFuncArgs) => {
    switch (sort) {
        case "price":
            return {
                price: sortOrder,
            };
        case "quantity":
            return {
                quantity: sortOrder,
            };
        case "orderId":
            return {
                orderId: sortOrder,
            };
        default:
            return {
                orderId: sortOrder,
            };
    }
};

export default orderSortFunc;
