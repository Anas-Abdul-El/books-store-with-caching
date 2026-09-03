/**
 * Auth controller
 * @module auth.controller
 * @author <Anas Abdul El>
 * @description This file contains the controller methods for authentication operations.
 * routers for login, register, refresh token, logout,
 * @exports authController
 */

import type { NextFunction, Request, Response } from "express";
import { authService } from "../services";
import type { LoginRequestBody, LoginResponseBody } from "../types/auth";
import { generateToken } from "../utils/token";

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

export default { userLogin };
