import { Router } from "express";
import { cartItemsController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { cartItemsSchema, updateCartItems } from "../validation/cartItems.schema";

const cartItemsRoutes: Router = Router();

// get all cart items routes with sorting and pagination " /cartItems?sort=&sortOrder=&limit= "
cartItemsRoutes.get(
    "/",
    authHandler("public"),
    validatorMiddleware(cartItemsSchema, "query"),
    catchAsync(cartItemsController.getAllCartItems),
);

// update the quantity of a cart item of the logged in user " /cartItems/:cartItemId "
cartItemsRoutes.patch(
    "/:cartItemId",
    authHandler("public"),
    validatorMiddleware(updateCartItems.params, "params"),
    validatorMiddleware(updateCartItems.body, "body"),
    catchAsync(cartItemsController.updateCartItem),
);

export default cartItemsRoutes;
