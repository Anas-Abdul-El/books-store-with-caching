import type { OrdersSchemaType } from "../validation/orders.schema";

interface ordersSortFuncArgs {
    sort: OrdersSchemaType["sort"];
    sortOrder: OrdersSchemaType["sortOrder"];
}

/**
 * ordersSortFunc builds the Prisma orderBy object for the orders list query.
 * @param sortArgs - The requested sort field and direction.
 * @returns A Prisma orderBy object (defaults to ascending orderId).
 */
const ordersSortFunc = ({ sort = "orderId", sortOrder = "asc" }: ordersSortFuncArgs) => {
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

export default ordersSortFunc;
