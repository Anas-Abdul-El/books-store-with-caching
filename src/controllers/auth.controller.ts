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
import { verifyEmail } from "../services/auth.services";
import type { LoginRequestBody, LoginResponseBody } from "../types/auth";
import AppError from "../utils/AppErr";
import { generateToken, verifyToken } from "../utils/token";
import type {
    RegisterSchemaType,
    SendVerificationCodeSchemaType,
    VerifyVerificationCodeSchemaType,
} from "../validation/auth.schema";

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

/**
 * logout handles the user logout process.
 * It verifies the refresh token from the request cookies, calls the authentication service to delete the user's session,
 * clears the refresh token cookie, and sends the appropriate response back to the client.
 * @param req - The Express request object containing the refresh token in cookies.
 * @param res - The Express response object used to send the response.
 * @param next - The next middleware function in the Express pipeline for error handling.
 */
const logout = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = verifyToken(req.cookies.refreshToken, "refresh") as {
        userId: string;
    };

    if (!refreshToken) next(new AppError("Refresh token not found", 400));

    await authService.logout(refreshToken.userId);
    res.clearCookie("refreshToken");
    res.status(200).send({ message: "Logged out successfully" });
};

/**
 * sentVerificationCode handles verifing the acc.
 * It send a verfication token by email provided by the body.
 * @param req - The Express request object containing the email in body.
 * @param res - The Express response object used to send the response.
 * @param next - The next middleware function in the Express pipeline for error handling.
 */
const sentVerificationCode = async (
    req: Request<{}, {}, SendVerificationCodeSchemaType, {}>,
    res: Response,
    next: NextFunction,
) => {
    const { email } = req.body;

    const verifyToken = generateToken({ email }, "verify");
    await authService.sendVerificationEmail(email, verifyToken);

    res.status(200).send({ msg: `code send to email: ${email}` });
};

/**
 * verifyVerificationCode handles verifing the acc.
 * It verifies the verify token provided by the email sent by the previos route
 * @param req - The Express request object containing the verify token in body.
 * @param res - The Express response object used to send the response.
 * @param next - The next middleware function in the Express pipeline for error handling.
 */
const verifyVerificationCode = async (
    req: Request<{}, {}, VerifyVerificationCodeSchemaType, {}>,
    res: Response,
    next: NextFunction,
) => {
    const { token } = req.body;

    await verifyEmail(token);

    res.status(200).send({ msg: "account has been verified" });
};

export default { userLogin, register, refreshAccessToken, logout, verifyVerificationCode, sentVerificationCode };
