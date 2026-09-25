import type { Prisma } from "../generated/prisma/browser";
import { prisma } from "../libs/prisma";
import categorySortFunc from "../utils/categorySort";
import removeUndefined from "../utils/removeUndefined";
import type {
    AddCategorySchemaType,
    CategoriesSchemaType,
    UpdateCategoriesBodySchemaType,
} from "../validation/category.schema";

/**
 * getCategory fetches a single category and its books from the database by id.
 * @param categoryId - The id of the category to retrieve.
 * @returns A Promise resolving to the category (with books) or null.
 */
const getCategory = async (categoryId: number) => {
    return await prisma.category.findUnique({
        where: { categoryId },
        include: {
            books: true,
        },
    });
};

/**
 * getAllCategories fetches every category from the database, applying the
 * requested sort and limit.
 * @param query - The sort/pagination query.
 * @returns A Promise resolving to the matching categories.
 */
const getAllCategories = async (query: CategoriesSchemaType) => {
    const { sort, sortOrder, limit } = query;

    return await prisma.category.findMany({
        orderBy: categorySortFunc({ sort, sortOrder }),
        ...(limit !== undefined && { take: limit }),
    });
};

/**
 * addCategory creates a new category in the database.
 * @param category - The validated category data to insert.
 * @returns A Promise resolving to the created category.
 */
const addCategory = (category: AddCategorySchemaType) => {
    const { name, description } = category;

    return prisma.category.create({
        data: {
            name,
            description: description ?? null,
        },
    });
};

/**
 * updateCategory updates an existing category's name and/or description.
 * @param id - The id of the category to update.
 * @param category - Partial category data with only the fields to change.
 * @returns A Promise resolving to the updated category.
 */
const updateCategory = async (id: number, category: UpdateCategoriesBodySchemaType) => {
    const data: Prisma.CategoryUpdateInput = removeUndefined(category);

    return await prisma.category.update({
        where: { categoryId: id },
        data,
    });
};

/**
 * deleteCategory removes a category from the database by id.
 * @param id - The id of the category to delete.
 * @returns A Promise that resolves once the category is deleted.
 */
const deleteCategory = async (id: number): Promise<void> => {
    await prisma.category.delete({
        where: { categoryId: id },
    });
};

export { addCategory, deleteCategory, getAllCategories, getCategory, updateCategory };