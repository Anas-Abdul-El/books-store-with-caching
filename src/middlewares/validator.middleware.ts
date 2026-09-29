import type { NextFunction, Request, Response } from "express";
import type zod from "zod";
import AppError from "../utils/AppErr";

/**
 * validatorMiddleware validates one part of the request (the body, the query,
 * the params or the cookies) against a Zod schema, and hands the *parsed* data
 * over to the next middleware, so the controllers never read raw unvalidated
 * input.
 *
 * Flow:
 *  1. Read the part of the request named by location.
 *  2. Run schema.safeParse on it.
 *  3. On a Zod error, forward a 400 AppError carrying the validation message.
 *  4. On a valid but undefined result, forward a 400 "Invalid request data".
 *  5. Replace the original value with the parsed one, which also applies the
 *     coercions of the schema (query params are strings, for instance).
 *  6. Call next() to continue the chain.
 *
 * @param schema - The Zod schema to validate against.
 * @param location - The part of the request to validate (defaults to "body").
 * @returns A middleware function validating the request data and either passing
 * control to the next middleware or forwarding an AppError.
 */
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
