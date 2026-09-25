import type { Category } from "../generated/prisma/browser";
import { connectRedis, redisClient } from "../libs/redis";
import { categoryRepo } from "../repo";
import AppError from "../utils/AppErr";
import createCategoriesCacheKey from "../utils/categoryCacheKey";
import type {
    AddCategorySchemaType,
    CategoriesSchemaType,
    UpdateCategoriesBodySchemaType,
} from "../validation/category.schema";

// A cached category stays in Redis for 1.5 hours (60 * 90 seconds) after being cached.
const CATEGORY_CACHE_TTL_SECONDS = 60 * 90;

/**
 * getCategoryById retrieves a single category by its unique ID, using a Redis
 * hash (key: "categories", field: "category:<categoryId>") as a cache in front
 * of the database so repeated reads avoid hitting PostgreSQL.
 *
 * Flow:
 *  1. Ensure the Redis client is connected.
 *  2. Try to read the category from the "categories" hash (cache hit path).
 *  3. On a hit, parse the stored JSON string and return it — no DB query.
 *  4. On a miss, fetch the category from the DB with categoryRepo.getCategory.
 *  5. If the category does not exist, throw a 404 AppError.
 *  6. Otherwise cache the DB result as a JSON string in the hash, then return it.
 *
 * @param categoryId - The unique ID of the category to load.
 * @returns A Promise resolving to the category (from cache or database).
 * @throws {AppError} With a 404 status when the category is not found.
 */
const getCategoryById = async (categoryId: number): Promise<Category> => {
    const redis = await connectRedis();

    const categoryKey = `category:${categoryId}`;

    const cachedCategory = await redis.hGet("categories", categoryKey);

    if (cachedCategory) {
        const parsedCategory = JSON.parse(cachedCategory) as Category;

        if (parsedCategory.categoryId !== categoryId) {
            throw new AppError("Invalid cached category data", 500);
        }

        return parsedCategory;
    }

    const category = await categoryRepo.getCategory(categoryId);

    if (!category) throw new AppError("Category not found", 404);

    await redis.hSet("categories", { [categoryKey]: JSON.stringify(category) });
    await redisClient.hExpire("categories", categoryKey, CATEGORY_CACHE_TTL_SECONDS);

    return category;
};

/**
 * getAllCategories retrieves all categories matching the given query, using a
 * Redis string key (built from the query via createCategoriesCacheKey) as a
 * cache in front of the database so repeated identical requests avoid hitting
 * PostgreSQL.
 *
 * Flow:
 *  1. Ensure the Redis client is connected.
 *  2. Build a deterministic cache key from the query.
 *  3. Try to read the cached JSON string (cache hit path).
 *  4. On a hit, parse the stored JSON string back into categories and return it.
 *  5. On a miss, fetch the categories from the DB with categoryRepo.getAllCategories.
 *  6. If no categories match the query, throw a 204 AppError.
 *  7. Otherwise cache the result as a JSON string with a TTL, then return it.
 *
 * @param query - The sort/pagination query used to select the categories.
 * @returns A Promise resolving to the matching categories (from cache or database).
 * @throws {AppError} With a 204 status when no categories are found.
 */
const getAllCategories = async (query: CategoriesSchemaType): Promise<Array<Category>> => {
    const redis = await connectRedis();

    const cachedCategoriesKey = createCategoriesCacheKey(query);

    const cachedCategories = await redis.get(cachedCategoriesKey);

    if (cachedCategories) return JSON.parse(cachedCategories);

    const categories = await categoryRepo.getAllCategories(query);

    if (!categories) throw new AppError("Empty", 204);

    await redis.set(cachedCategoriesKey, JSON.stringify(categories), { EX: CATEGORY_CACHE_TTL_SECONDS });

    return categories;
};

/**
 * addCategory creates a new category in the database.
 *
 * Flow:
 *  1. Delegate the insert to the category repository (categoryRepo.addCategory).
 *  2. Return the newly created category.
 *
 * @param category - The validated category data to insert.
 * @returns A Promise resolving to the newly created category.
 */
const addCategory = async (category: AddCategorySchemaType): Promise<Category> => {
    return await categoryRepo.addCategory(category);
};

/**
 * updateCategory updates an existing category's editable fields.
 *
 * Flow:
 *  1. Verify the category exists via categoryRepo.getCategory.
 *  2. If it does not exist, throw a 404 AppError.
 *  3. Otherwise apply the partial update via categoryRepo.updateCategory and return it.
 *
 * @param id - The ID of the category to update.
 * @param category - An object with the category fields to change (all optional).
 * @returns A Promise resolving to the updated category.
 * @throws {AppError} With a 404 status when the category is not found.
 */
const updateCategory = async (id: number, category: UpdateCategoriesBodySchemaType): Promise<Category> => {
    const categorySelected = await categoryRepo.getCategory(id);

    if (!categorySelected) throw new AppError("Category not found", 404);

    return await categoryRepo.updateCategory(id, category);
};

/**
 * deleteCategory removes an existing category from the database.
 *
 * Flow:
 *  1. Verify the category exists via categoryRepo.getCategory.
 *  2. If it does not exist, throw a 404 AppError.
 *  3. Otherwise delete it via categoryRepo.deleteCategory.
 *
 * @param id - The ID of the category to delete.
 * @returns A Promise that resolves once the category is deleted.
 * @throws {AppError} With a 404 status when the category is not found.
 */
const deleteCategory = async (id: number): Promise<void> => {
    const category = await categoryRepo.getCategory(id);

    if (!category) throw new AppError("Category not found", 404);

    await categoryRepo.deleteCategory(id);
};

export { addCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory };
