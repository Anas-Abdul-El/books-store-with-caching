import { Router } from "express";
import { authController } from "../controllers";
import { validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { authSchema } from "../validation/auth.schema";

const authRouter: Router = Router();

// login route
authRouter.post("/login", validatorMiddleware(authSchema, "body"), catchAsync(authController.userLogin));

// register route

// refresh token route

// logout route

// verify account route

export default authRouter;
