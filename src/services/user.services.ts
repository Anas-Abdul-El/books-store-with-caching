import transporter from "../libs/nodemailer";
import { getUserByVerificationToken } from "../repo/auth.repo";
import { createPasswordResetToken, updatePassword } from "../repo/user.repo";
import AppError from "../utils/AppErr";
import { compareHash, createHash } from "../utils/hash";
import { verifyToken } from "../utils/token";

const sendPasswordResetCode = async (email: string, token: string) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/password-reset?token=${token}`;

    await createPasswordResetToken(email, token);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Your Password",
        html: `<p>Reset Your Password By Clicking The Link Below</p>
           <a href="${verificationUrl}">Reset Your Password</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new AppError("Failed to send verification email", 500);
    }
};

const verifyPasswordResetCode = async (newPassword: string, oldPassword: string, token: string) => {
    const isTokenValid = verifyToken(token, "verify");
    if (isTokenValid) throw new AppError("invalid or expired token", 400);

    const user = await getUserByVerificationToken(token);
    if (!user) throw new AppError("Invalid or expired verification token", 400);

    const isPasswordCorrect = await compareHash(oldPassword, user.password);
    if (!isPasswordCorrect) throw new AppError("wrong password", 400);

    const now = new Date();
    if (user.resetPasswordCodeExpiresAt! > now) {
        throw new AppError("Invalid or expired verification token", 400);
    }

    const password = await createHash(newPassword);
    await updatePassword(user.userId, password);
};

export { sendPasswordResetCode, verifyPasswordResetCode };
