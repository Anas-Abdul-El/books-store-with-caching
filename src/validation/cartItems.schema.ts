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

export type { CartItemsSchemaType };

export { cartItemsSchema };
