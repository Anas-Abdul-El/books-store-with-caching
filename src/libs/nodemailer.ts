//
// nodemailer.ts
//
// This file configures the Nodemailer transporter for sending emails in the application.
// It creates a reusable transporter instance using environment variables for SMTP configuration.
//

import nodemailer from "nodemailer";

/**
 * transporter is a configured Nodemailer instance for sending emails.
 * It uses SMTP configuration from environment variables for email delivery.
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default transporter;
