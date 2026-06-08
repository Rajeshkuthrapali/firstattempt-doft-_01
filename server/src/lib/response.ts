import type { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: Array<{ path: string; message: string }>;
}

/**
 * Send a successful response with data.
 */
export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data } satisfies SuccessResponse<T>);
}

/**
 * Send a paginated response.
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: { page: number; limit: number; total: number },
  status = 200,
): void {
  res.status(status).json({
    success: true,
    data,
    meta: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  } satisfies PaginatedResponse<T>);
}

/**
 * Send an error response.
 */
export function sendError(
  res: Response,
  error: string,
  status = 400,
  details?: Array<{ path: string; message: string }>,
): void {
  const body: ErrorResponse = { success: false, error };
  if (details) body.details = details;
  res.status(status).json(body);
}
