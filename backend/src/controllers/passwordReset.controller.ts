import type { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/User.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/password.js";
import { sendMail } from "../services/emailService.js";

// In-memory store: token → { userId, expiresAt }
// For production use Redis or a DB collection
const resetTokens = new Map<string, { userId: string; expiresAt: number }>();

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };
  if (typeof email !== "string" || !email.trim()) {
    throw new AppError(400, "email required", "VALIDATION_ERROR");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // Always respond success to prevent email enumeration
  if (!user) {
    sendSuccess(res, 200, { message: "If that email exists, a reset link has been sent." });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 30 * 60 * 1000 }); // 30 min

  const resetUrl = `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <div style="background: #003466; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 18px;">ScholarFlow</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 28px 24px; border-radius: 0 0 12px 12px;">
        <h3 style="margin: 0 0 12px; color: #111827;">Password Reset Request</h3>
        <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
          Hi <strong>${user.name}</strong>, we received a request to reset your password.
          Click the button below to set a new password. This link expires in 30 minutes.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #003466; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 20px;">
          Reset Password
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  await sendMail(user.email, "Reset your ScholarFlow password", html);
  sendSuccess(res, 200, { message: "If that email exists, a reset link has been sent." });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body as { token?: string; password?: string };
  if (typeof token !== "string" || !token.trim()) {
    throw new AppError(400, "token required", "VALIDATION_ERROR");
  }
  if (typeof password !== "string" || password.length < 6) {
    throw new AppError(400, "password must be at least 6 characters", "VALIDATION_ERROR");
  }

  const entry = resetTokens.get(token);
  if (!entry || entry.expiresAt < Date.now()) {
    resetTokens.delete(token);
    throw new AppError(400, "Reset link is invalid or has expired", "VALIDATION_ERROR");
  }

  const hashed = await hashPassword(password);
  await User.findByIdAndUpdate(entry.userId, {
    password: hashed,
    refreshTokenHash: null, // invalidate all sessions
  });

  resetTokens.delete(token);
  sendSuccess(res, 200, { message: "Password reset successfully. Please log in." });
}
