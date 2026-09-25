import { Router } from "express";
import authRouter from "./authRouter";
import authorRouter from "./authorRouter";
import bookRouter from "./bookRouter";
import categoryRouter from "./categoryRouter";
import userRouter from "./userRouter";

const router: Router = Router();

router.use("/auth/", authRouter);
router.use("/user/", userRouter);
router.use("/book/", bookRouter);
router.use("/author/", authorRouter);
router.use("/category/", categoryRouter);

export default router;
