import { Router } from "express";
import { categoryController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import {
    addCategorySchema,
    categoriesSchema,
    categorySchema,
    deleteCategory,
    updateCategory,
} from "../validation/category.schema";

const categoryRouter: Router = Router();

// get category by its id " /category/:id "
categoryRouter.get(
    "/category/:id",
    validatorMiddleware(categorySchema, "params"),
    catchAsync(categoryController.getCategoryById),
);

// get all categories routes with sorting and pagination " /categories?sort=&sortOrder=&limit= "
categoryRouter.get(
    "/categories",
    validatorMiddleware(categoriesSchema, "query"),
    catchAsync(categoryController.getAllCategories),
);

// add category " /category "
categoryRouter.post(
    "/category",
    authHandler,
    validatorMiddleware(addCategorySchema, "body"),
    catchAsync(categoryController.addCategory),
);

// update category " /category/:id "
categoryRouter.patch(
    "/category/:id",
    authHandler,
    validatorMiddleware(updateCategory.params, "params"),
    validatorMiddleware(updateCategory.body, "body"),
    catchAsync(categoryController.updateCategory),
);

// delete category " /category/:id "
categoryRouter.delete(
    "/category/:id",
    authHandler,
    validatorMiddleware(deleteCategory, "params"),
    catchAsync(categoryController.deleteCategory),
);

export default categoryRouter;