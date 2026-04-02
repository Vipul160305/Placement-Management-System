import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User.js";
import type { UserRole } from "../constants/roles.js";
import { isUserRole } from "../constants/roles.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "./asyncHandler.js";

/** Wrapped for Express 4: async errors must reach `next(err)` or they become unhandled rejections. */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Missing or invalid Authorization header", "UNAUTHORIZED");
  }
  const token = header.slice("Bearer ".length).trim();
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError(401, "Invalid or expired access token", "UNAUTHORIZED");
  }

  const user = await User.findById(payload.sub).select(
    "email role department section"
  );
  if (!user) {
    throw new AppError(401, "User not found", "UNAUTHORIZED");
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    department: user.department,
    section: user.section,
  };
  next();
});

export function authorize(...allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const role = req.user?.role;
      if (!role || !allowed.includes(role)) {
        throw new AppError(403, "Forbidden for this role", "FORBIDDEN");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function parseRole(value: string): UserRole {
  if (!isUserRole(value)) {
    throw new AppError(400, "Invalid role", "VALIDATION_ERROR");
  }
  return value;
}
