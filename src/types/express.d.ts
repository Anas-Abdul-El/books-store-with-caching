// Express type augmentations shared by the whole app.

declare global {
    namespace Express {
        interface Request {
            /**
             * The id of the authenticated user, set by the authHandler
             * middleware, so protected controllers can scope a query to the
             * user who owns the data without trusting the request body.
             */
            userId: string;
        }
    }
}

export {};
