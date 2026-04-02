import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

export function validateRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
    return;
  }
  const details = errors.array({ onlyFirstError: false }).map((e) => ({
    path: "path" in e ? e.path : e.type,
    msg: e.msg,
  }));
  next(new AppError(400, "Validation failed", "VALIDATION_ERROR", details));
}
