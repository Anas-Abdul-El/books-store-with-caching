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
