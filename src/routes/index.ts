import { Router } from "express";
import authRouter from "./userRouter";

const router: Router = Router();

router.use("/auth/", authRouter);

export default router;
