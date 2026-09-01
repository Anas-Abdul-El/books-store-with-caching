/**
 * This middleware function validates the request data against a provided Zod schema.
 * @param {zod.ZodObject} schema - The Zod schema to validate against.
 * @param {"body" | "query" | "params" | "cookies"} [location="body"] - The location of the data to validate (default is "body").
 * @returns {Function} A middleware function that validates the request data and either passes control to the next middleware or returns an error response.
 */

import type { NextFunction, Request, Response } from "express";
import type zod from "zod";

const validatorMiddleware = (schema: zod.ZodObject, location: "body" | "query" | "params" | "cookies" = "body") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const reqBody = req[location];
        const { error, data } = schema.safeParse(reqBody);

        if (error) {
            // TODO : send error messages to custom error class
            return next(error);
        }

        // TODO : send error messages to custom error class
        if (data === undefined) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid request data",
            });
        }

        req[location] = data;
        next();
    };
};

export default validatorMiddleware;
