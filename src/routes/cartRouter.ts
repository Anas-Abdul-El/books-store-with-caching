import { Router } from "express";
import { cartController } from "../controllers";
import { authHandler } from "../middlewares";
import catchAsync from "../utils/catchAsync";

const cartRouter: Router = Router();

// get the cart of the logged in user with its items " /cart "
cartRouter.get("/", authHandler("public"), catchAsync(cartController.getCartByUserId));

export default cartRouter;
