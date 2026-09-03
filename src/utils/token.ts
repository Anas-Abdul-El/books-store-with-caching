import jwt from "jsonwebtoken";
import AppError from "./AppErr";

type TokenType = "access" | "refresh" | "verify";

/**
 * generateToken generates a JWT token based on the provided payload and type (access or refresh).
 * @param payload - The payload to include in the token.
 * @param type - The type of token to generate ("access" or "refresh
 */
export const generateToken = (payload: object, type: TokenType) => {
    const secretKey =
        type === "access"
            ? process.env.ACCESS_TOKEN_SECRET!
            : type === "refresh"
              ? process.env.REFRESH_TOKEN_SECRET!
              : process.env.VERIFICATION_TOKEN_SECRET!;

    const expiresIn = type === "access" ? "1h" : type === "refresh" ? "7d" : "1h";
    return jwt.sign(payload, secretKey, { expiresIn });
};

/**
 * verifyToken verifies the provided JWT token based on its type (access or refresh).
 * @param token - The JWT token to verify.
 * @param type - The type of token to verify ("access" or "refresh").
 * @returns The decoded payload if the token is valid; otherwise, throws an AppError.
 */
export const verifyToken = (token: string, type: TokenType) => {
    const secretKey =
        type === "access"
            ? process.env.ACCESS_TOKEN_SECRET!
            : type === "refresh"
              ? process.env.REFRESH_TOKEN_SECRET!
              : process.env.VERIFICATION_TOKEN_SECRET!;

    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        throw new AppError("Invalid or expired token", 401);
    }
};
