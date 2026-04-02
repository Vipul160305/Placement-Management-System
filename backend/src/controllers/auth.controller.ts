import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { hashPassword, hashToken, verifyPassword, verifyTokenHash } from "../utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { recordAudit } from "../services/auditService.js";

function publicUser(u: InstanceType<typeof User>) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    section: u.section,
    branch: u.branch,
    cgpa: u.cgpa,
    backlogCount: u.backlogCount,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const {
    name,
    email,
    password,
    department,
    section,
    branch,
    cgpa,
    backlogCount,
  } = req.body as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    throw new AppError(400, "name, email, password required", "VALIDATION_ERROR");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    throw new AppError(409, "Email already registered", "CONFLICT");
  }

  const hashed = await hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashed,
    role: "student",
    department: typeof department === "string" ? department.trim() : undefined,
    section: typeof section === "string" ? section.trim() : undefined,
    branch: typeof branch === "string" ? branch.trim() : undefined,
    cgpa: typeof cgpa === "number" ? cgpa : undefined,
    backlogCount: typeof backlogCount === "number" ? backlogCount : 0,
  });

  await recordAudit({
    actorId: user.id,
    action: "auth.register",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  sendSuccess(res, 201, { user: publicUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") {
    throw new AppError(400, "email and password required", "VALIDATION_ERROR");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password +refreshTokenHash"
  );
  if (!user || !(await verifyPassword(password, user.password))) {
    throw new AppError(401, "Invalid credentials", "UNAUTHORIZED");
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefreshToken({ sub: user.id });
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  await recordAudit({
    actorId: user.id,
    action: "auth.login",
    entityType: "User",
    entityId: user.id,
  });

  sendSuccess(res, 200, {
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (typeof refreshToken !== "string") {
    throw new AppError(400, "refreshToken required", "VALIDATION_ERROR");
  }

  let decoded: { sub: string };
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid refresh token", "UNAUTHORIZED");
  }

  const user = await User.findById(decoded.sub).select(
    "+refreshTokenHash email role"
  );
  if (!user?.refreshTokenHash) {
    throw new AppError(401, "Refresh token revoked", "UNAUTHORIZED");
  }

  const valid = await verifyTokenHash(refreshToken, user.refreshTokenHash);
  if (!valid) {
    throw new AppError(401, "Invalid refresh token", "UNAUTHORIZED");
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const newRefresh = signRefreshToken({ sub: user.id });
  user.refreshTokenHash = await hashToken(newRefresh);
  await user.save();

  sendSuccess(res, 200, { accessToken, refreshToken: newRefresh });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  await recordAudit({
    actorId: userId,
    action: "auth.logout",
    entityType: "User",
    entityId: userId,
  });
  sendSuccess(res, 200, { loggedOut: true });
}
