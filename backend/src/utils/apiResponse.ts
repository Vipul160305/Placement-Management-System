import type { Response } from "express";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export function sendSuccess<T>(res: Response, status: number, data: T): void {
  res.status(status).json({ success: true, data } satisfies ApiSuccess<T>);
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
): void {
  res.status(status).json({
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  } satisfies ApiFailure);
}
