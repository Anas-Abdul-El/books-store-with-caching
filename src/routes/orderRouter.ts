import { Router } from "express";
import { orderController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { createOrderSchema, deleteOrder, orderSchema, updateOrder } from "../validation/order.schema";

const orderRouter: Router = Router();

// get all orders routes with sorting and pagination, admins only " /orders?sort=&sortOrder=&limit= "
orderRouter.get("/", authHandler("private"), validatorMiddleware(orderSchema, "query"), catchAsync(orderController.getAllOrders));

// create an order out of the cart of the logged in user " /orders "
orderRouter.post(
    "/",
    authHandler("public"),
    validatorMiddleware(createOrderSchema, "body"),
    catchAsync(orderController.createOrder),
);

// update the delivery address of an order, admins only " /orders/:orderId "
orderRouter.patch(
    "/:orderId",
    authHandler("private"),
    validatorMiddleware(updateOrder.params, "params"),
    validatorMiddleware(updateOrder.body, "body"),
    catchAsync(orderController.updateOrder),
);

// delete an order with its items, admins only " /orders/:orderId "
orderRouter.delete(
    "/:orderId",
    authHandler("private"),
    validatorMiddleware(deleteOrder, "params"),
    catchAsync(orderController.deleteOrder),
);

export default orderRouter;
