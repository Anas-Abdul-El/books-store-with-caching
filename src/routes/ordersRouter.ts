import { Router } from "express";
import { ordersController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { deleteOrder, ordersSchema, updateOrder } from "../validation/orders.schema";

const ordersRouter: Router = Router();

// get all orders routes with sorting and pagination, admins only " /orders?sort=&sortOrder=&limit= "
ordersRouter.get(
    "/",
    authHandler("private"),
    validatorMiddleware(ordersSchema, "query"),
    catchAsync(ordersController.getAllOrders),
);

// update the delivery address of an order, admins only " /orders/:orderId "
ordersRouter.patch(
    "/:orderId",
    authHandler("private"),
    validatorMiddleware(updateOrder.params, "params"),
    validatorMiddleware(updateOrder.body, "body"),
    catchAsync(ordersController.updateOrder),
);

// delete an order with its items, admins only " /orders/:orderId "
ordersRouter.delete(
    "/:orderId",
    authHandler("private"),
    validatorMiddleware(deleteOrder, "params"),
    catchAsync(ordersController.deleteOrder),
);

export default ordersRouter;
