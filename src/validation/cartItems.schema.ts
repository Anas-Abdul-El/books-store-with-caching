import z, { coerce } from "zod";

/**
 * cartItemsSchema validates the query params used to list cart items
 * (sort field, sort order, and pagination limit).
 */
const cartItemsSchema = z.object({
    sort: z.enum(["price", "quantity", "cartItemId"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    limit: coerce.number().optional(),
});

type CartItemsSchemaType = z.infer<typeof cartItemsSchema>;

/**
 * updateCartItems holds the schemas used to update a cart item:
 * the route params (the cart item id) and the body (the new quantity).
 * The price is never taken from the client, it is re-read from the book.
 */
const updateCartItems = {
    params: z.object({
        cartItemId: z.uuid(),
    }),
    body: z.object({
        quantity: coerce.number().int().positive(),
    }),
};

type UpdateCartItemsParamsSchemaType = z.infer<typeof updateCartItems.params>;

type UpdateCartItemsBodySchemaType = z.infer<typeof updateCartItems.body>;

export type { CartItemsSchemaType, UpdateCartItemsBodySchemaType, UpdateCartItemsParamsSchemaType };

export { cartItemsSchema, updateCartItems };
