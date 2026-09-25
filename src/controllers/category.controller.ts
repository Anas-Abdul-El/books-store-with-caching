import type { NextFunction, Request, Response } from "express";
import type { Category } from "../generated/prisma/browser";
import { categoryService } from "../services";
import type {
    AddCategorySchemaType,
    CategoriesSchemaType,
    DeleteCategorySchemaType,
    UpdateCategoriesBodySchemaType,
    UpdateCategoriesParamsSchemaType,
} from "../validation/category.schema";

/**
 * getCategoryById fetches a single category by its id and sends it to the client.
 * The id is read from the route params; the lookup is delegated to categoryService.
 * @param req - The Express request; expects the category id in the route params.
 * @param res - The Express response typed as {@link Response}<{@link Category}>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the category is sent.
 */
const getCategoryById = async (
    req: Request<DeleteCategorySchemaType, {}, {}, {}>,
    res: Response<Category>,
    next: NextFunction,
) => {
    const categoryId = req.params.id;

    const category = await categoryService.getCategoryById(categoryId);

    res.send(category);
};

/**
 * getAllCategories fetches all categories matching the query (sort/pagination)
 * and sends them to the client.
 * @param req - The Express request; expects the query params.
 * @param res - The Express response typed as {@link Response}<Array<{@link Category}>>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the categories are sent.
 */
const getAllCategories = async (
    req: Request<{}, {}, {}, CategoriesSchemaType>,
    res: Response<Array<Category>>,
    next: NextFunction,
) => {
    const query = req.query;

    const categories = await categoryService.getAllCategories(query);

    res.send(categories);
};

/**
 * addCategory creates a new category from the request body and sends it back.
 * @param req - The Express request; expects the category data in the body.
 * @param res - The Express response typed as {@link Response}<{@link Category}>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the created category is sent.
 */
const addCategory = async (
    req: Request<{}, {}, AddCategorySchemaType, {}>,
    res: Response<Category>,
    next: NextFunction,
) => {
    const categoryData = req.body;

    const addedCategory = await categoryService.addCategory(categoryData);

    res.send(addedCategory);
};

/**
 * updateCategory updates an existing category from the request body and sends
 * the updated category back.
 * @param req - The Express request; expects the category id in params and the
 * partial data in the body.
 * @param res - The Express response typed as {@link Response}<{@link Category}>.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the updated category is sent.
 */
const updateCategory = async (
    req: Request<UpdateCategoriesParamsSchemaType, {}, UpdateCategoriesBodySchemaType, {}>,
    res: Response<Category>,
    next: NextFunction,
) => {
    const {
        body,
        params: { id },
    } = req;

    const updatedCategory = await categoryService.updateCategory(id, body);

    res.send(updatedCategory);
};

/**
 * deleteCategory deletes an existing category by id and sends a confirmation
 * message.
 * @param req - The Express request; expects the category id in the route params.
 * @param res - The Express response that sends the confirmation message.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the category is deleted.
 */
const deleteCategory = async (
    req: Request<DeleteCategorySchemaType, {}, {}, {}>,
    res: Response<string>,
    next: NextFunction,
) => {
    const id = req.params.id;

    await categoryService.deleteCategory(id);

    res.send("the category deleted succ");
};

export default { getCategoryById, getAllCategories, addCategory, updateCategory, deleteCategory };