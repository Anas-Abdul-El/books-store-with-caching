import { Router } from "express";
import { userController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import {
    getUserByIdSchema,
    sendPasswordResetTokenSchema,
    verifyPasswordResetTokenSchema,
} from "../validation/user.schema";

const userRouter: Router = Router();

// get single user route
userRouter.get(
    "/:id",
    authHandler("public"),
    validatorMiddleware(getUserByIdSchema, "params"),
    catchAsync(userController.getUserById),
);

// get all users route
userRouter.get("/users", authHandler("private"), catchAsync(userController.getUsers));

// sendPasswordresetToken route to send a reset password token
userRouter.post(
    "/sendPasswordresetCode",
    authHandler("private"),
    validatorMiddleware(sendPasswordResetTokenSchema, "body"),
    catchAsync(userController.sentPasswordResetToken),
);

// verifyVerificationToken route to verify the email send by the sendPasswordresetCode route
userRouter.post(
    "/verifyPasswordresetCode",
    authHandler("private"),
    validatorMiddleware(verifyPasswordResetTokenSchema, "body"),
    catchAsync(userController.verifyPasswordResetToken),
);

export default userRouter;
