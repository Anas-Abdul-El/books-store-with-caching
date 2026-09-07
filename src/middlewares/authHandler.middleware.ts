//
// authHandler.middleware.ts
//
// This file defines the authentication middleware for the application.
// It verifies JWT tokens from the Authorization header and checks user roles to protect routes.
//

import type { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppErr";
import { verifyToken } from "../utils/token";

/**
 * authHandler is a middleware factory that returns an authentication middleware.
 * It verifies the JWT access token from the Authorization header and checks the user's role
 * to determine if they have access to the route.
 * @param privacy - A string indicating the access level: "public" allows any authenticated user, "private" restricts to admin users only.
 * @returns An Express middleware function that authenticates and authorizes requests.
 */
const authHandler = (privacy: "public" | "private") => (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.Authorization as string;
    if (!auth) next(new AppError("login first", 401));

    const token = auth.split(" ")[1];
    if (!token) next(new AppError("token unfound", 400));

    let payload;
    try {
        payload = verifyToken(token!, "access") as {
            role: "user" | "admin";
            userId: string;
        };
    } catch (error) {
        next(new AppError("unAuthorized", 401));
    }

    (req as any).userId = payload!.userId;

    if (privacy === "public") return next();

    const { role } = payload!;
    if (role === "admin") return next();

    next(new AppError("forbidden routes", 403));
};

export default authHandler;
