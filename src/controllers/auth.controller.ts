/**
 * Auth controller
 * @module auth.controller
 * @author <Anas Abdul El>
 * @description This file contains the controller methods for authentication operations.
 * routers for login, register, refresh token, logout,
 * @exports authController
 */

import type { NextFunction, Request, Response } from "express";
import type { User } from "../generated/prisma/browser";
import { saveSessionToken } from "../repo/auth.repo";
import { authService } from "../services";
import type { LoginRequestBody, LoginResponseBody } from "../types/auth";
import { generateToken } from "../utils/token";
import type { RegisterSchemaType } from "../validation/auth.schema";

/**
 * login handles the user login process.
 * It receives the login data from the request body, calls the authentication service to authenticate the user,
 * generates access and refresh tokens, and sends the appropriate response back to the client.
 * @param req - The Express request object containing the login data.
 * @param res - The Express response object used to send the response.
 * @param next - The next middleware function in the Express pipeline for error handling.
 */
const userLogin = async (
    req: Request<{}, {}, LoginRequestBody, {}>,
    res: Response<LoginResponseBody>,
    next: NextFunction,
) => {
    const user = await authService.loginUser(req.body);

    const accessToken = generateToken({ userId: user.userId }, "access");
    const refreshToken = generateToken({ userId: user.userId }, "refresh");

    await saveSessionToken(user.userId, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).send({ accessToken, email: user.email, username: user.firstName });
};

/**
 * register handles the user registration process.
 * It receives the registration data from the request body, calls the authentication service to register the user,
 * and sends the appropriate response back to the client.
 * @param req - The Express request object containing the registration data.
 * @param res - The Express response object used to send the response.
 * @param next - The next middleware function in the Express pipeline for error handling.
 */
const register = async (
    req: Request<{}, {}, RegisterSchemaType, {}>,
    res: Response<Omit<User, "password">>,
    next: NextFunction,
) => {
    const user = await authService.registerUser(req.body);
    res.status(201).send(user);
};

/**
 * refresh Access Token handles the user access token refreshing process.
 * @param req - The Express request object containing the refreshToken.
 * @param res - The Express response object used to send the response.
 * @param next - The next middleware function in the Express pipeline for error handling.
 */
const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    const newToken = await authService.refreshAccessToken(refreshToken);

    res.json({ accessToken: newToken });
};

export default { userLogin, register, refreshAccessToken };
