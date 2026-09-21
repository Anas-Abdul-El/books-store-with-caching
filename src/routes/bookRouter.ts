import { Router } from "express";
import { bookController } from "../controllers";
import { validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { bookSchema, booksSchema } from "../validation/book.schema";

const bookRouter: Router = Router();

// get books by its id " /book "
bookRouter.get("/book/:id", validatorMiddleware(bookSchema, "params"), catchAsync(bookController.getBookById));

// get all books routes with filters and sorting " /books?filter=&sort=&limit= "
bookRouter.get("/books", validatorMiddleware(booksSchema, "query"), catchAsync(bookController.getAllbook));

// add book " /book "
bookRouter.post("/book", (req, res) => {});

// update book " /book/:id "

// delete book " /book/:id "

export default bookRouter;
