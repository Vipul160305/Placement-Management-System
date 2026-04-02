export interface ApiError extends Error {
  code?: string;
  details?: unknown;
}

export function toApiError(message: string, code?: string, details?: unknown): ApiError {
  const err = new Error(message) as ApiError;
  err.code = code;
  err.details = details;
  return err;
}
