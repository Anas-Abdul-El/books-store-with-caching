import { Router } from "express";
import { authController } from "../controllers";
import { validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { authSchema, registerSchema } from "../validation/auth.schema";

const authRouter: Router = Router();

// login route
authRouter.post("/login", validatorMiddleware(authSchema, "body"), catchAsync(authController.userLogin));

// register route
authRouter.post("/register", validatorMiddleware(registerSchema, "body"), catchAsync(authController.register));

// refresh token route
authRouter.post("/refresh", catchAsync(authController.refreshAccessToken));

// logout route
authRouter.post("/logout", catchAsync(authController.logout));

// verify account route

export default authRouter;
