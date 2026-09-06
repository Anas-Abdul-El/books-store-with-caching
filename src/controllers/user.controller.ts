import type { NextFunction, Request, Response } from "express";
import { userService } from "../services";
import { generateToken } from "../utils/token";

const sentPasswordResetToken = async (
    req: Request<{}, {}, SendPasswordResetCodeSchemaType, {}>,
    res: Response,
    next: NextFunction,
) => {
    const { email } = req.body;
    const token = generateToken({ email }, "verify");

    await userService.sendPasswordResetToken(email, token);

    res.status(200).send({ msg: `code send to email: ${email}` });
};

const verifyPasswordResetToken = async (
    req: Request<{}, {}, VerifyPasswordResetCodeSchemaType, {}>,
    res: Response,
    next: NextFunction,
) => {
    const { token, oldPassword, newPassword } = req.body;

    await userService.verifyPasswordResetToken(newPassword, oldPassword, token);

    res.status(200).send({ msg: "password has been reset" });
};

export { sentPasswordResetToken, verifyPasswordResetToken };
