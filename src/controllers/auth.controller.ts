/**
 * Auth controller
 * @module auth.controller
 * @author <Anas Abdul El>
 * @description This file contains the controller methods for authentication operations.
 * routers for login, register, refresh token, logout,
 * @exports authController
 */

import type { NextFunction, Request, Response } from "express";
import type { LoginRequestBody, LoginResponseBody } from "../types/auth";

const userLogin = async (
    req: Request<{}, {}, LoginRequestBody, {}>,
    res: Response<LoginResponseBody>,
    next: NextFunction,
) => {};

export default { userLogin };
