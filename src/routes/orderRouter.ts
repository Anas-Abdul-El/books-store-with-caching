import { Router } from "express";
import { ordersController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { addOrderSchema, deleteOrder, ordersSchema, updateOrder } from "../validation/orders.schema";

const orderRouter: Router = Router();

// get all orders routes with sorting and pagination, admins only " /orders?sort=&sortOrder=&limit= "
orderRouter.get("/", authHandler("private"), validatorMiddleware(ordersSchema, "query"), catchAsync(ordersController.getAllOrders));

// create an order out of the cart of the logged in user " /orders "
orderRouter.post(
    "/",
    authHandler("public"),
    validatorMiddleware(addOrderSchema, "body"),
    catchAsync(ordersController.addOrder),
);

// update the delivery address of an order, admins only " /orders/:orderId "
orderRouter.patch(
    "/:orderId",
    authHandler("private"),
    validatorMiddleware(updateOrder.params, "params"),
    validatorMiddleware(updateOrder.body, "body"),
    catchAsync(ordersController.updateOrder),
);

// delete an order with its items, admins only " /orders/:orderId "
orderRouter.delete(
    "/:orderId",
    authHandler("private"),
    validatorMiddleware(deleteOrder, "params"),
    catchAsync(ordersController.deleteOrder),
);

export default orderRouter;
