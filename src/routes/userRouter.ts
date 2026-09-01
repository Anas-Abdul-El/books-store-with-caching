import { Router } from "express";
import { authController } from "../controllers";
import { validatorMiddleware } from "../middlewares";
import { authSchema } from "../validation/auth.schema";

const userRouter: Router = Router();

// login route
userRouter.post("/login", validatorMiddleware(authSchema, "body"), authController.login);

// register route

// refresh token route

// logout route

// verify account route

// password reset route

// get user profile route

// update user profile route

export default userRouter;
