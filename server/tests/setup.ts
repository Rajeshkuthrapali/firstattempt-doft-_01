/**
 * Vitest global setup — mocks for external services.
 */
import { vi } from "vitest";

// Mock environment variables before anything imports env.ts
process.env.PORT = "4001";
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.JWT_SECRET = "test-secret-key-must-be-at-least-32-characters-long";
process.env.JWT_EXPIRES_IN = "1h";
process.env.RAZORPAY_KEY_ID = "rzp_test_mock_key_id";
process.env.RAZORPAY_KEY_SECRET = "rzp_test_mock_key_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "rzp_test_webhook_secret";
process.env.FRONTEND_URL = "http://localhost:5173";

// Mock Prisma client
vi.mock("../src/lib/prisma", () => ({
  prisma: {
    variant: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    orderItem: {
      findMany: vi.fn(),
    },
    payment: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    promoCode: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) =>
      fn({
        variant: { update: vi.fn() },
        order: { create: vi.fn(), update: vi.fn() },
        orderItem: { findMany: vi.fn() },
        payment: { update: vi.fn() },
        promoCode: { update: vi.fn() },
      }),
    ),
  },
}));

// Mock Razorpay client
vi.mock("../src/lib/razorpay", () => ({
  razorpayClient: {
    orders: {
      create: vi.fn(),
    },
    payments: {
      fetch: vi.fn(),
    },
  },
}));

// Mock Stripe client
vi.mock("../src/lib/stripe", () => ({
  stripeClient: null,
}));
