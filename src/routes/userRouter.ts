import { Router } from "express";
import { userController } from "../controllers";
import { validatorMiddleware } from "../middlewares";
import authHandler from "../middlewares/authHandler.middleware";
import catchAsync from "../utils/catchAsync";
import {
    getUserByIdSchema,
    sendPasswordResetTokenSchema,
    verifyPasswordResetTokenSchema,
} from "../validation/user.schema";

const userRouter: Router = Router();

// get single user route
userRouter.get(
    "/user/:id",
    authHandler,
    validatorMiddleware(getUserByIdSchema, "params"),
    catchAsync(userController.getUserById),
);

// get all users route

// sendPasswordresetToken route to send a reset password token
userRouter.post(
    "/user/sendPasswordresetCode",
    authHandler,
    validatorMiddleware(sendPasswordResetTokenSchema, "body"),
    catchAsync(userController.sentPasswordResetToken),
);

// verifyVerificationToken route to verify the email send by the sendPasswordresetCode route
userRouter.post(
    "/user/verifyPasswordresetCode",
    authHandler,
    validatorMiddleware(verifyPasswordResetTokenSchema, "body"),
    catchAsync(userController.verifyPasswordResetToken),
);

export default userRouter;
