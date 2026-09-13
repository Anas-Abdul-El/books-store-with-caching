import { Router } from "express";
import authRouter from "./authRouter";
import bookRouter from "./bookRouter";
import userRouter from "./userRouter";

const router: Router = Router();

router.use("/auth/", authRouter);
router.use("/user/", userRouter);
router.use("/book/", bookRouter);

export default router;
