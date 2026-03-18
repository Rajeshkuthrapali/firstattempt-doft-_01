import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * JWT payload shape stored inside the token.
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

/**
 * Middleware that requires a valid JWT Bearer token.
 * Sets `req.user` on success, responds 401 on failure.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, error: "Missing authorization header" });
    return;
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

/**
 * Middleware that optionally extracts JWT from the header.
 * Does NOT reject unauthenticated requests — sets `req.user` if token is valid.
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const token = header.slice(7);
      req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      // Invalid token in optional auth — proceed without user
    }
  }
  next();
}

/**
 * Middleware that restricts access to ADMIN role only.
 * Must be placed AFTER `requireAuth`.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ success: false, error: "Admin access required" });
    return;
  }
  next();
}

/**
 * Signs a JWT token for a given user.
 *
 * @param payload - User info to embed in the token
 * @returns Signed JWT string
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}
