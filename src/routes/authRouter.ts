import { Router } from "express";
import { authController } from "../controllers";
import { validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import {
    authSchema,
    registerSchema,
    sendVerificationCodeSchema,
    verifyVerificationCodeSchema,
} from "../validation/auth.schema";

const authRouter: Router = Router();

// login route
authRouter.post("/login", validatorMiddleware(authSchema, "body"), catchAsync(authController.userLogin));

// register route
authRouter.post("/register", validatorMiddleware(registerSchema, "body"), catchAsync(authController.register));

// refresh token route
authRouter.post("/refresh", catchAsync(authController.refreshAccessToken));

// logout route
authRouter.post("/logout", catchAsync(authController.logout));

// sendVerifyCode route to send a verify token
authRouter.post(
    "/sendVerificationCode",
    validatorMiddleware(sendVerificationCodeSchema, "body"),
    catchAsync(authController.sentVerificationCode),
);

// verifyVerificationCode route to verify the email send by the sendVerifyCode route
authRouter.post(
    "/verifyVerificationCode",
    validatorMiddleware(verifyVerificationCodeSchema, "body"),
    catchAsync(authController.verifyVerificationCode),
);

export default authRouter;
