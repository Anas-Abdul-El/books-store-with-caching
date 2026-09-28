import z, { coerce } from "zod";

/**
 * ordersSchema validates the query params used to list orders
 * (sort field, sort order, and pagination limit).
 */
const ordersSchema = z.object({
    sort: z.enum(["price", "quantity", "orderId"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    limit: coerce.number().optional(),
});

type OrdersSchemaType = z.infer<typeof ordersSchema>;

/**
 * addOrderSchema validates the body used to create an order. Only the delivery
 * address comes from the client: the items, the quantities and the prices are
 * read from the cart of the logged in user inside the transaction.
 */
const addOrderSchema = z.object({
    address: z.string().min(5),
});

type AddOrderSchemaType = z.infer<typeof addOrderSchema>;

/**
 * updateOrder holds the schemas used to update an order:
 * the route params (the order id) and the body (the new address).
 * The quantity and the price of an order are derived from its items, so an
 * admin can only correct the delivery address.
 */
const updateOrder = {
    params: z.object({
        orderId: z.uuid(),
    }),
    body: z.object({
        address: z.string(),
    }),
};

type UpdateOrderParamsSchemaType = z.infer<typeof updateOrder.params>;

type UpdateOrderBodySchemaType = z.infer<typeof updateOrder.body>;

/**
 * deleteOrder validates the route param used to delete an order.
 */
const deleteOrder = z.object({
    orderId: z.uuid(),
});

type DeleteOrderSchemaType = z.infer<typeof deleteOrder>;

export type {
    AddOrderSchemaType,
    DeleteOrderSchemaType,
    OrdersSchemaType,
    UpdateOrderBodySchemaType,
    UpdateOrderParamsSchemaType,
};

export { addOrderSchema, deleteOrder, ordersSchema, updateOrder };
