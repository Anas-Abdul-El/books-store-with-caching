import { Router } from "express";
import { userController } from "../controllers";
import { validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { sendPasswordResetTokenSchema, verifyPasswordResetTokenSchema } from "../validation/user.schema";

const userRouter: Router = Router();

// get all users route

// get single user route

// sendPasswordresetToken route to send a reset password token
userRouter.post(
    "/user/sendPasswordresetCode",
    validatorMiddleware(sendPasswordResetTokenSchema, "body"),
    catchAsync(userController.sentPasswordResetToken),
);

// verifyVerificationToken route to verify the email send by the sendPasswordresetCode route
userRouter.post(
    "/user/verifyPasswordresetCode",
    validatorMiddleware(verifyPasswordResetTokenSchema, "body"),
    catchAsync(userController.verifyPasswordResetToken),
);

export default userRouter;
