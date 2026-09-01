/**
 * Auth controller
 * @module auth.controller
 * @author <Anas Abdul El>
 * @description This file contains the controller methods for authentication operations.
 * routers for login, register, refresh token, logout,
 * @exports authController
 */

import type { NextFunction, Request, Response } from "express";

const authController = {
    login: (req: Request, res: Response, next: NextFunction) => {},

    register: (req: Request, res: Response, next: NextFunction) => {},

    refreshToken: (req: Request, res: Response, next: NextFunction) => {},

    logout: (req: Request, res: Response, next: NextFunction) => {},
};

export default authController;
