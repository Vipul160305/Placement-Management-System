import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { AppError } from "../utils/AppError.js";
import { sendError } from "../utils/apiResponse.js";

function isMongoDuplicateKey(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  );
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      sendError(res, 400, "VALIDATION_ERROR", "File too large (max 5 MB)");
      return;
    }
    sendError(res, 400, "VALIDATION_ERROR", err.message);
    return;
  }

  if (err instanceof AppError) {
    sendError(
      res,
      err.statusCode,
      err.code ?? "APP_ERROR",
      err.message,
      err.details
    );
    return;
  }

  if (isMongoDuplicateKey(err)) {
    sendError(
      res,
      409,
      "CONFLICT",
      "A record with this unique field already exists"
    );
    return;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: string }).name === "CastError"
  ) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid id format");
    return;
  }

  console.error(err);
  sendError(res, 500, "INTERNAL_ERROR", "Internal server error");
}
