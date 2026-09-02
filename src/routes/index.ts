import { Router } from "express";
import { authController } from "../controllers";
import userRouter from "./userRouter";

const router: Router = Router();

router.use("/users/", userRouter, authController.UserLogin);

export default router;
