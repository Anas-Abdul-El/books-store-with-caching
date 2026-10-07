import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import AppError from "../utils/AppErr";

const PRISMA_ERROR_STATUS: Record<string, { statusCode: number; message: string }> = {
    P2025: { statusCode: 404, message: "Resource not found" },
    P2002: { statusCode: 409, message: "Resource already exists" },
    P2003: { statusCode: 400, message: "Related resource does not exist" },
    P2000: { statusCode: 400, message: "Missing required field" },
};

const notFound = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        status: "fail",
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);

    let statusCode = 500;
    let message = "Something went wrong";

    const knownPrismaError =
        err instanceof Prisma.PrismaClientKnownRequestError ? PRISMA_ERROR_STATUS[err.code] : undefined;

    if (err instanceof AppError) {
        ({ statusCode, message } = err);
    } else if (knownPrismaError) {
        ({ statusCode, message } = knownPrismaError);
    } else {
        console.error(`[error] ${req.method} ${req.originalUrl}`, err);
    }

    res.status(statusCode).json({
        status: statusCode.toString().startsWith("5") ? "error" : "fail",
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export default errorHandler;
export { notFound };