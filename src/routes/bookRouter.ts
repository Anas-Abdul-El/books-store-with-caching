import { Router } from "express";
import { bookController } from "../controllers";
import { validatorMiddleware } from "../middlewares";
import { bookSchema } from "../validation/book.schema";

const bookRouter: Router = Router();

// get books by its id " /book "
bookRouter.get("/book/:id", validatorMiddleware(bookSchema, "query"), bookController.getBookById);

// get all books routes with filters and sorting " /books?filter=&sort=&limit= "
bookRouter.get("/books");

// add book " /book/:id "

// update book " /book/:id "

// delete book " /book/:id "

export default bookRouter;
