/**
 * Sentry error monitoring — captures uncaught errors, React component
 * errors, and custom payment/checkout exceptions.
 *
 * Setup: Add Sentry DSN to `.env` as `VITE_SENTRY_DSN`.
 * Install: `npm install @sentry/react`
 *
 * Note: This module uses dynamic imports. When `@sentry/react` is not
 * installed, all functions gracefully no-op so the app doesn't crash.
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Lazy-loaded Sentry reference (typed as any to avoid hard dep) */
let Sentry: any = null;

/**
 * Initialises the Sentry SDK. Called once in `main.tsx`.
 * No-ops if `VITE_SENTRY_DSN` is not set or `@sentry/react` is missing.
 */
export async function initSentry(): Promise<void> {
  if (!SENTRY_DSN) return;

  try {
    // Use computed specifier to bypass Vite's static import analysis.
    // This allows the try-catch to handle missing @sentry/react gracefully.
    const sentryModule = "@sentry/" + "react";
    Sentry = await import(/* @vite-ignore */ sentryModule);
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
    });
  } catch {
    // @sentry/react not installed — silently ignore
    console.warn("[Sentry] SDK not installed — error monitoring disabled");
  }
}

/**
 * Captures an exception with optional context tags.
 *
 * @param error - The error to report
 * @param context - Additional context for the error
 */
export function captureError(
  error: unknown,
  context?: Record<string, string>,
): void {
  if (!Sentry) return;
  Sentry.withScope((scope: any) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Captures a payment-specific error with gateway details.
 *
 * @param gateway - 'razorpay' | 'stripe'
 * @param errorCode - Gateway error code
 * @param errorMessage - Human-readable error message
 * @param orderId - Internal order ID
 */
export function capturePaymentError(
  gateway: "razorpay" | "stripe",
  errorCode: string,
  errorMessage: string,
  orderId?: string,
): void {
  if (!Sentry) return;
  Sentry.withScope((scope: any) => {
    scope.setTag("payment.gateway", gateway);
    scope.setTag("payment.error_code", errorCode);
    if (orderId) scope.setTag("payment.order_id", orderId);
    scope.setLevel("error");
    Sentry.captureMessage(
      `Payment Error [${gateway}]: ${errorCode} — ${errorMessage}`,
    );
  });
}

/**
 * Sets the current user context in Sentry.
 *
 * @param userId - User identifier
 * @param email - Optional email
 */
export function setUser(userId: string, email?: string): void {
  if (!Sentry) return;
  Sentry.setUser({ id: userId, email });
}

/**
 * Adds a breadcrumb for tracking user actions (e.g., checkout steps).
 *
 * @param message - Descriptive breadcrumb message
 * @param category - Breadcrumb category (e.g., 'checkout', 'payment')
 * @param data - Optional additional data
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
): void {
  if (!Sentry) return;
  Sentry.addBreadcrumb({ message, category, data, level: "info" });
}

/**
 * Returns the Sentry ErrorBoundary component, or null if SDK is not loaded.
 * Use: `const ErrorBoundary = getErrorBoundary();`
 */
export function getErrorBoundary(): any | null {
  return Sentry?.ErrorBoundary ?? null;
}
