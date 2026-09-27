import { Router } from "express";
import { cartItemsController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { cartItemsSchema, deleteCartItem, updateCartItems } from "../validation/cartItems.schema";

const cartItemsRouter: Router = Router();

// get all cart items routes with sorting and pagination " /cartItems?sort=&sortOrder=&limit= "
cartItemsRouter.get(
    "/",
    authHandler("private"),
    validatorMiddleware(cartItemsSchema, "query"),
    catchAsync(cartItemsController.getAllCartItems),
);

// update the quantity of a cart item of the logged in user " /cartItems/:cartItemId "
cartItemsRouter.patch(
    "/:cartItemId",
    authHandler("public"),
    validatorMiddleware(updateCartItems.params, "params"),
    validatorMiddleware(updateCartItems.body, "body"),
    catchAsync(cartItemsController.updateCartItem),
);

// delete a cart item of the logged in user " /cartItems/:cartItemId "
cartItemsRouter.delete(
    "/:cartItemId",
    authHandler("public"),
    validatorMiddleware(deleteCartItem, "params"),
    catchAsync(cartItemsController.deleteCartItem),
);

export default cartItemsRouter;
