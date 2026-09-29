import type { NextFunction, Request, Response } from "express";
import type { User } from "../generated/prisma/browser";
import { userService } from "../services";
import { generateToken } from "../utils/token";
import type {
    GetUserByIdSchemaType,
    SendPasswordResetTokenSchemaType,
    VerifyPasswordResetTokenSchemaType,
} from "../validation/user.schema";

/**
 * sentPasswordResetToken signs a verification token for the requested email,
 * hands it to the service to store and mail, then answers with a short
 * confirmation. The token is never returned to the client.
 * @param req - The Express request; expects the email in the body.
 * @param res - The Express response that sends the confirmation message.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the mail is on its way.
 */
const sentPasswordResetToken = async (
    req: Request<{}, {}, SendPasswordResetTokenSchemaType, {}>,
    res: Response,
    next: NextFunction,
) => {
    const { email } = req.body;
    const token = generateToken({ email }, "verify");

    await userService.sendPasswordResetToken(email, token);

    res.status(200).send({ msg: `code send to email: ${email}` });
};

/**
 * verifyPasswordResetToken completes a password reset: it checks the token
 * sent by mail together with the current password, then stores the hashed new
 * password.
 * @param req - The Express request; expects the token, the old password and the
 * new password in the body.
 * @param res - The Express response that sends the confirmation message.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the password is updated.
 */
const verifyPasswordResetToken = async (
    req: Request<{}, {}, VerifyPasswordResetTokenSchemaType, {}>,
    res: Response,
    next: NextFunction,
) => {
    const { token, oldPassword, newPassword } = req.body;

    await userService.verifyPasswordResetToken(newPassword, oldPassword, token);

    res.status(200).send({ msg: "password has been reset" });
};

/**
 * getUserById fetches a single user by their id and sends them to the client.
 * The id comes from the route params, so it can never be tampered with in the
 * body.
 * @param req - The Express request; expects the user id in the route params.
 * @param res - The Express response typed as {@link Response}<{@link User}>; sends the user to the client.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the user is sent.
 */
const getUserById = async (
    req: Request<GetUserByIdSchemaType, {}, {}, {}>,
    res: Response<User>,
    next: NextFunction,
) => {
    const userId = req.params.id;

    const user = await userService.getUserById(userId);

    res.status(200).json(user);
};

/**
 * getUsers fetches every user of the store and sends the list to the client.
 * The route behind it has no validator, so no query params are needed.
 * @param req - The Express request (no params are read from it).
 * @param res - The Express response that sends the list of users.
 * @param next - The Express next middleware callback (unused).
 * @returns A Promise that resolves once the users are sent.
 */
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    const users = await userService.getAllUsers();

    res.status(200).json(users);
};

export default {
    sentPasswordResetToken,
    verifyPasswordResetToken,
    getUserById,
    getUsers,
};
