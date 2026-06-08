import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
}

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------

/**
 * Hash a plaintext password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// Token generation (internal)
// ---------------------------------------------------------------------------

/** Generate a random unique token ID for refresh token rotation. */
function generateJti(): string {
  return crypto.randomUUID();
}

/** Sign a short-lived access token (default 15 min). */
function signAccessToken(payload: {
  userId: string;
  email: string;
  role: string;
}): string {
  return jwt.sign({ ...payload, type: "access" }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/** Sign a long-lived refresh token (7 days) with a jti for rotation. */
function signRefreshToken(payload: { userId: string; jti: string }): string {
  return jwt.sign(
    { ...payload, type: "refresh" },
    env.JWT_SECRET,
    { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` },
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register a new user account.
 * Throws `AuthError` if the email is already registered.
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string,
): Promise<{
  user: { id: string; email: string; name: string | null; role: string };
  tokens: TokenPair;
}> {
  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError("Email already registered", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: "CUSTOMER" },
  });

  const tokens = await generateTokenPair(user.id, user.email, user.role);

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    tokens,
  };
}

/**
 * Authenticate an existing user with email and password.
 * Throws `AuthError` if credentials are invalid.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<{
  user: { id: string; email: string; name: string | null; role: string };
  tokens: TokenPair;
}> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new AuthError("Invalid email or password", 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid email or password", 401);
  }

  const tokens = await generateTokenPair(user.id, user.email, user.role);

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    tokens,
  };
}

/**
 * Refresh an access token using a valid refresh token.
 * Implements token rotation: the old refresh token is revoked and a new
 * pair is issued. If a revoked token is reused, ALL tokens for that user
 * are revoked as a theft-detection measure.
 */
export async function refreshToken(
  refreshTokenStr: string,
): Promise<TokenPair> {
  let payload: { userId: string; jti: string; type: string };
  try {
    payload = jwt.verify(refreshTokenStr, env.JWT_SECRET) as any;
  } catch {
    throw new AuthError("Invalid or expired refresh token", 401);
  }

  if (payload.type !== "refresh") {
    throw new AuthError("Invalid token type", 401);
  }

  // Check if the refresh token was already revoked (rotation / theft detection)
  const stored = await prisma.refreshToken.findUnique({
    where: { jti: payload.jti },
  });

  if (!stored || stored.revoked) {
    // Possible token theft — revoke ALL tokens for this user
    if (stored?.revoked) {
      await prisma.refreshToken.updateMany({
        where: { userId: payload.userId, revoked: false },
        data: { revoked: true },
      });
    }
    throw new AuthError("Token has been revoked", 401);
  }

  // Mark this refresh token as used (rotation)
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  // Get user info for new tokens
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });
  if (!user) {
    throw new AuthError("User not found", 404);
  }

  return generateTokenPair(user.id, user.email, user.role);
}

/**
 * Logout — revoke the refresh token so it cannot be used again.
 * Silently succeeds even if the token is invalid (idempotent from the
 * client's perspective).
 */
export async function logoutUser(refreshTokenStr: string): Promise<void> {
  try {
    const payload = jwt.verify(refreshTokenStr, env.JWT_SECRET) as any;
    if (payload.type === "refresh") {
      await prisma.refreshToken.updateMany({
        where: { jti: payload.jti, revoked: false },
        data: { revoked: true },
      });
    }
  } catch {
    // Invalid token — still a successful logout from client's perspective
  }
}

// ---------------------------------------------------------------------------
// Token pair generation
// ---------------------------------------------------------------------------

/**
 * Generate both an access token and a refresh token.
 * Persists a hash of the refresh token in the database for rotation tracking.
 */
async function generateTokenPair(
  userId: string,
  email: string,
  role: string,
): Promise<TokenPair> {
  const jti = generateJti();
  const accessToken = signAccessToken({ userId, email, role });
  const refreshToken = signRefreshToken({ userId, jti });

  // Store a SHA-256 hash of the refresh token (never store the raw token)
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      jti,
      expiresAt,
    },
  });

  // 15 minutes in seconds
  return { accessToken, refreshToken, expiresIn: 900 };
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}
