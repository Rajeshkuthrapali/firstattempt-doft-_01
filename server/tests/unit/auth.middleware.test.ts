import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const { requireAuth, optionalAuth, requireAdmin, signToken } =
  await import("../../src/middleware/auth.js");

// Helpers to create mock Express objects
function mockRequest(headers: Record<string, string> = {}): Partial<Request> {
  return { headers };
}

function mockResponse(): Partial<Response> & {
  statusCode: number;
  body: unknown;
} {
  const res: Partial<Response> & { statusCode: number; body: unknown } = {
    statusCode: 200,
    body: null,
    status(code: number) {
      res.statusCode = code;
      return res as Response;
    },
    json(data: unknown) {
      res.body = data;
      return res as Response;
    },
  };
  return res;
}

describe("requireAuth middleware", () => {
  it("should reject requests without authorization header", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();

    requireAuth(req as Request, res as Response, next as NextFunction);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject invalid tokens", () => {
    const req = mockRequest({ authorization: "Bearer invalid.token.here" });
    const res = mockResponse();
    const next = vi.fn();

    requireAuth(req as Request, res as Response, next as NextFunction);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should set req.user and call next for valid tokens", () => {
    const token = signToken({
      userId: "user-1",
      email: "test@test.com",
      role: "CUSTOMER",
    });

    const req = mockRequest({ authorization: `Bearer ${token}` });
    const res = mockResponse();
    const next = vi.fn();

    requireAuth(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect((req as Request & { user?: JwtPayload }).user?.userId).toBe(
      "user-1",
    );
  });
});

describe("optionalAuth middleware", () => {
  it("should proceed without user when no header is present", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();

    optionalAuth(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect((req as Request & { user?: JwtPayload }).user).toBeUndefined();
  });

  it("should set user for valid tokens", () => {
    const token = signToken({
      userId: "user-2",
      email: "buyer@test.com",
      role: "CUSTOMER",
    });

    const req = mockRequest({ authorization: `Bearer ${token}` });
    const res = mockResponse();
    const next = vi.fn();

    optionalAuth(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect((req as Request & { user?: JwtPayload }).user?.userId).toBe(
      "user-2",
    );
  });
});

describe("requireAdmin middleware", () => {
  it("should reject non-admin users", () => {
    const req = mockRequest();
    (req as Request & { user?: JwtPayload }).user = {
      userId: "user-1",
      email: "test@test.com",
      role: "CUSTOMER",
    };
    const res = mockResponse();
    const next = vi.fn();

    requireAdmin(req as Request, res as Response, next as NextFunction);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow admin users", () => {
    const req = mockRequest();
    (req as Request & { user?: JwtPayload }).user = {
      userId: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    };
    const res = mockResponse();
    const next = vi.fn();

    requireAdmin(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
  });
});

describe("signToken", () => {
  it("should produce a valid JWT with correct payload", () => {
    const token = signToken({
      userId: "user-99",
      email: "sign@test.com",
      role: "CUSTOMER",
    });

    const decoded = jwt.verify(
      token,
      "test-secret-key-must-be-at-least-32-characters-long",
    ) as jwt.JwtPayload;

    expect(decoded.userId).toBe("user-99");
    expect(decoded.email).toBe("sign@test.com");
    expect(decoded.role).toBe("CUSTOMER");
  });
});
