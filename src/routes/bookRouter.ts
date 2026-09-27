import { Router } from "express";
import { bookController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { addBookSchema, bookSchema, booksSchema, deleteBook, updateBook } from "../validation/book.schema";

const bookRouter: Router = Router();

// get books by its id " /book "
bookRouter.get("/:id", validatorMiddleware(bookSchema, "params"), catchAsync(bookController.getBookById));

// get all books routes with filters and sorting " /books?filter=&sort=&limit= "
bookRouter.get("/", validatorMiddleware(booksSchema, "query"), catchAsync(bookController.getAllbook));

// add book " /book "
bookRouter.post(
    "/",
    authHandler("private"),
    validatorMiddleware(addBookSchema, "body"),
    catchAsync(bookController.addBook),
);

// update book " /book/:id "
bookRouter.patch(
    "/:id",
    authHandler("private"),
    validatorMiddleware(updateBook.params, "params"),
    validatorMiddleware(updateBook.body, "body"),
    catchAsync(bookController.updateBook),
);

// delete book " /book/:id "
bookRouter.delete(
    "/id",
    authHandler("private"),
    validatorMiddleware(deleteBook, "params"),
    catchAsync(bookController.deleteBook),
);

export default bookRouter;
