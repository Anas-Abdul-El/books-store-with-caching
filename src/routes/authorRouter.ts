import { Router } from "express";
import { authorController } from "../controllers";
import { authHandler, validatorMiddleware } from "../middlewares";
import catchAsync from "../utils/catchAsync";
import { addAuthorSchema, authorSchema, authorsSchema, deleteAuthor, updateAuthor } from "../validation/author.schema";

const authorRouter: Router = Router();

// get author by its id " /author/:id "
authorRouter.get("/author/:id", validatorMiddleware(authorSchema, "params"), catchAsync(authorController.getAuthorById));

// get all authors routes with sorting and pagination " /authors?sort=&sortOrder=&limit= "
authorRouter.get("/authors", validatorMiddleware(authorsSchema, "query"), catchAsync(authorController.getAllAuthors));

// add author " /author "
authorRouter.post("/author", authHandler, validatorMiddleware(addAuthorSchema, "body"), catchAsync(authorController.addAuthor));

// update author " /author/:id "
authorRouter.patch(
    "/author/:id",
    authHandler,
    validatorMiddleware(updateAuthor.params, "params"),
    validatorMiddleware(updateAuthor.body, "body"),
    catchAsync(authorController.updateAuthor),
);

// delete author " /author/:id "
authorRouter.delete(
    "/author/:id",
    authHandler,
    validatorMiddleware(deleteAuthor, "params"),
    catchAsync(authorController.deleteAuthor),
);

export default authorRouter;