/**
 * This middleware function validates the request data against a provided Zod schema.
 * @param {zod.ZodObject} schema - The Zod schema to validate against.
 * @param {"body" | "query" | "params" | "cookies"} [location="body"] - The location of the data to validate (default is "body").
 * @returns {Function} A middleware function that validates the request data and either passes control to the next middleware or returns an error response.
 */

import type { NextFunction, Request, Response } from "express";
import type zod from "zod";
import AppError from "../utils/AppErr";

const validatorMiddleware = (schema: zod.ZodObject, location: "body" | "query" | "params" | "cookies" = "body") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const reqBody = req[location];
        const { error, data } = schema.safeParse(reqBody);

        if (error) return next(new AppError(error.message, 400));

        if (data === undefined) return next(new AppError("Invalid request data", 400));

        req[location] = data;
        return next();
    };
};

export default validatorMiddleware;
