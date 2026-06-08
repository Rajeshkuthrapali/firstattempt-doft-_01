import type { Request, Response } from "express";
import { z } from "zod";
import { DomainError } from "../lib/domain-error.js";
import { sendSuccess, sendError } from "../lib/response.js";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  AuthError,
} from "../services/auth.service.js";
import { securityLogger } from "../services/security-logger.js";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/register
 */
export async function handleRegister(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);
    const result = await registerUser(body.email, body.password, body.name);
    sendSuccess(res, result, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, error.errors[0].message, 400);
      return;
    }
    if (error instanceof AuthError || error instanceof DomainError) {
      securityLogger.warn("auth_failed_register", {
        email: req.body?.email,
        reason: error.message,
        ip: req.ip,
      });
      sendError(res, error.message, error.statusCode);
      return;
    }
    console.error("Register error:", error);
    sendError(res, "Internal server error", 500);
  }
}

/**
 * POST /api/auth/login
 */
export async function handleLogin(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const result = await loginUser(body.email, body.password);
    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, error.errors[0].message, 400);
      return;
    }
    if (error instanceof AuthError || error instanceof DomainError) {
      securityLogger.warn("auth_failed_login", {
        email: req.body?.email,
        reason: error.message,
        ip: req.ip,
      });
      sendError(res, error.message, error.statusCode);
      return;
    }
    console.error("Login error:", error);
    sendError(res, "Internal server error", 500);
  }
}

/**
 * POST /api/auth/refresh
 */
export async function handleRefresh(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const body = refreshSchema.parse(req.body);
    const tokens = await refreshToken(body.refreshToken);
    sendSuccess(res, { tokens });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, error.errors[0].message, 400);
      return;
    }
    if (error instanceof AuthError || error instanceof DomainError) {
      sendError(res, error.message, error.statusCode);
      return;
    }
    console.error("Refresh error:", error);
    sendError(res, "Internal server error", 500);
  }
}

/**
 * POST /api/auth/logout
 */
export async function handleLogout(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const body = logoutSchema.parse(req.body);
    await logoutUser(body.refreshToken);
    sendSuccess(res, { message: "Logged out successfully" });
  } catch {
    // Even if invalid token, logout is successful from client perspective
    sendSuccess(res, { message: "Logged out successfully" });
  }
}

/**
 * GET /api/auth/me
 */
export async function handleMe(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { user: req.user });
}
