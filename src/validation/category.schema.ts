import z, { coerce } from "zod";

/**
 * categorySchema validates the route param used to fetch a single category by id.
 */
const categorySchema = z.object({
    id: coerce.number(),
});

type CategorySchemaType = z.infer<typeof categorySchema>;

/**
 * categoriesSchema validates the query params used to list categories
 * (sort, sort order, and pagination limit).
 */
const categoriesSchema = z.object({
    sort: z.enum(["name", "categoryId"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    limit: coerce.number().optional(),
});

type CategoriesSchemaType = z.infer<typeof categoriesSchema>;

/**
 * addCategorySchema validates the body used to create a new category.
 */
const addCategorySchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});

type AddCategorySchemaType = z.infer<typeof addCategorySchema>;

/**
 * updateCategory holds the schemas used to update a category:
 * the route params (category id) and the optional body fields.
 */
const updateCategory = {
    params: z.object({
        id: coerce.number(),
    }),
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
    }),
};

type UpdateCategoriesBodySchemaType = z.infer<typeof updateCategory.body>;

type UpdateCategoriesParamsSchemaType = z.infer<typeof updateCategory.params>;

/**
 * deleteCategorySchema validates the route param used to delete a category.
 */
const deleteCategory = z.object({
    id: coerce.number(),
});

type DeleteCategorySchemaType = z.infer<typeof deleteCategory>;

export type {
    AddCategorySchemaType,
    CategoriesSchemaType,
    CategorySchemaType,
    DeleteCategorySchemaType,
    UpdateCategoriesBodySchemaType,
    UpdateCategoriesParamsSchemaType,
};

export { addCategorySchema, categoriesSchema, categorySchema, deleteCategory, updateCategory };