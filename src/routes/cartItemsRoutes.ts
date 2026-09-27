import { Router } from "express";
import { cartItemsController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { cartItemsSchema } from "../validation/cartItems.schema";

const cartItemsRoutes: Router = Router();

// get all cart items routes with sorting and pagination " /cartItems?sort=&sortOrder=&limit= "
cartItemsRoutes.get(
    "/",
    authHandler("public"),
    validatorMiddleware(cartItemsSchema, "query"),
    catchAsync(cartItemsController.getAllCartItems),
);

export default cartItemsRoutes;
