import { Router } from "express";
import { cartItemController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { cartItemSchema, deleteCartItem, updateCartItem } from "../validation/cartItem.schema";

const cartItemRouter: Router = Router();

// get all cart items routes with sorting and pagination " /cartItems?sort=&sortOrder=&limit= "
cartItemRouter.get(
    "/",
    authHandler("private"),
    validatorMiddleware(cartItemSchema, "query"),
    catchAsync(cartItemController.getAllCartItems),
);

// update the quantity of a cart item of the logged in user " /cartItems/:cartItemId "
cartItemRouter.patch(
    "/:cartItemId",
    authHandler("public"),
    validatorMiddleware(updateCartItem.params, "params"),
    validatorMiddleware(updateCartItem.body, "body"),
    catchAsync(cartItemController.updateCartItem),
);

// delete a cart item of the logged in user " /cartItems/:cartItemId "
cartItemRouter.delete(
    "/:cartItemId",
    authHandler("public"),
    validatorMiddleware(deleteCartItem, "params"),
    catchAsync(cartItemController.deleteCartItem),
);

export default cartItemRouter;
