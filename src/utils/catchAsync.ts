//
// catchAsync.ts
//
// This file defines a utility middleware for handling asynchronous route handlers in Express.
// It wraps asynchronous functions to catch any errors and pass them to the error handling middleware.
//

import type { NextFunction, Request, Response } from "express";

/**
 * catchAsync is a higher-order function that wraps asynchronous route handlers in Express.
 * It catches any errors thrown in the asynchronous function and passes them to the next middleware for error handling.
 * This helps to avoid repetitive try-catch blocks in each route handler.
 * @param fn - The asynchronous function (route handler) to be wrapped.
 * @returns A new function that handles the request, response, and next middleware.
 */
const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default catchAsync;
