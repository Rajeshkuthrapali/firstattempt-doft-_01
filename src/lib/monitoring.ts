/**
 * Sentry error monitoring initialization.
 * Only active when SENTRY_DSN is set.
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

interface SentryError {
  message: string;
  stack?: string;
  extra?: Record<string, unknown>;
}

/**
 * Initialize Sentry-like error monitoring.
 * In production, this would use @sentry/nextjs.
 * For now, provides a lightweight error boundary pattern.
 */
export function initErrorMonitoring() {
  if (typeof window === "undefined") return;

  // Global error handler
  window.addEventListener("error", (event) => {
    captureError({
      message: event.message,
      stack: event.error?.stack,
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    captureError({
      message: `Unhandled rejection: ${event.reason}`,
      stack: event.reason?.stack,
    });
  });
}

/**
 * Capture and report an error.
 */
export function captureError(error: SentryError) {
  if (SENTRY_DSN) {
    // In production, would send to Sentry:
    // Sentry.captureException(error);
    console.error("[Sentry]", error.message, error.extra);
  } else {
    console.error("[Error Monitor]", error.message, error.extra);
  }
}

/**
 * Capture a breadcrumb for debugging context.
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
) {
  if (SENTRY_DSN) {
    // Sentry.addBreadcrumb({ category, message, data });
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(`[Breadcrumb/${category}]`, message, data);
  }
}

/**
 * Set user context for error tracking.
 */
export function setUser(user: { id: string; email: string } | null) {
  if (SENTRY_DSN) {
    // Sentry.setUser(user);
  }
}
