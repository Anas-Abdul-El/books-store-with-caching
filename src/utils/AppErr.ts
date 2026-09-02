/**
 * A custom error class that extends the built-in Error class. It is used to create operational errors that can be handled gracefully by the application.
 * @class
 * @extends Error
 * @property {number} statusCode - The HTTP status code associated with the error.
 * @property {string} status - A string indicating the type of error ("fail" for client errors, "error" for server errors).
 * @property {boolean} isOperational - A boolean indicating whether the error is operational (true) or a programming error (false).
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code associated with the error.
 */
class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);

        this.statusCode = statusCode;
        this.status = statusCode.toString().startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
