import type { Request, Response } from "express";

/**
 * Global error handler that catches domain errors and unhandled exceptions,
 * returning a consistent JSON error envelope.
 */
export function errorHandler(
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
): void {
  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;

  if (statusCode === 500) {
    console.error("[ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
