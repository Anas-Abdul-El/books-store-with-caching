import z, { coerce } from "zod";

/**
 * cartItemSchema validates the query params used to list cart items
 * (sort field, sort order, and pagination limit).
 */
const cartItemSchema = z.object({
    sort: z.enum(["price", "quantity", "cartItemId"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    limit: coerce.number().optional(),
});

type CartItemSchemaType = z.infer<typeof cartItemSchema>;

/**
 * updateCartItem holds the schemas used to update a cart item:
 * the route params (the cart item id) and the body (the new quantity).
 * The price is never taken from the client, it is re-read from the book.
 */
const updateCartItem = {
    params: z.object({
        cartItemId: z.uuid(),
    }),
    body: z.object({
        quantity: coerce.number().int().positive(),
    }),
};

type UpdateCartItemParamsSchemaType = z.infer<typeof updateCartItem.params>;

type UpdateCartItemBodySchemaType = z.infer<typeof updateCartItem.body>;

/**
 * deleteCartItem validates the route param used to delete a cart item.
 */
const deleteCartItem = z.object({
    cartItemId: z.uuid(),
});

type DeleteCartItemSchemaType = z.infer<typeof deleteCartItem>;

export type {
    CartItemSchemaType,
    DeleteCartItemSchemaType,
    UpdateCartItemBodySchemaType,
    UpdateCartItemParamsSchemaType,
};

export { cartItemSchema, deleteCartItem, updateCartItem };
