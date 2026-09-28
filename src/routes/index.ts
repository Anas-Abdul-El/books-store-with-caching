import { Router } from "express";
import authRouter from "./authRouter";
import authorRouter from "./authorRouter";
import bookRouter from "./bookRouter";
import cartItemsRoutes from "./cartItemsRouter";
import cartRouter from "./cartRouter";
import categoryRouter from "./categoryRouter";
import orderRouter from "./orderRouter";
import userRouter from "./userRouter";

const router: Router = Router();

router.use("/auth/", authRouter);
router.use("/user/", userRouter);
router.use("/book/", bookRouter);
router.use("/author/", authorRouter);
router.use("/category/", categoryRouter);
router.use("/cartItems/", cartItemsRoutes);
router.use("/cart/", cartRouter);
router.use("/orders/", orderRouter);

export default router;
