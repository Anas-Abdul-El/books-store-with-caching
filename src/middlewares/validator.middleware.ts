import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod/v3";

const validatorMiddleware = (schema: ZodSchema, location: "body" | "query" | "params" | "cookies" = "body") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const reqBody = req[location];
        const result = schema.safeParse(reqBody);

        if (!result.success) {
            const errorMessages = result.error.errors.map(err => err.message);
            // TODO : send error messages to custom error class
            return next(errorMessages);
        }

        req[location] = result.data;
        next();
    };
};

export default validatorMiddleware;
