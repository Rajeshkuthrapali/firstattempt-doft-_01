// ---------------------------------------------------------------------------
// Structured security event logging
// ---------------------------------------------------------------------------

export type SecurityEventType =
  | "auth_failed_login"
  | "auth_failed_register"
  | "csrf_violation"
  | "rate_limit_breach"
  | "webhook_invalid_signature"
  | "webhook_amount_mismatch"
  | "webhook_order_not_found"
  | "payment_invalid_transition"
  | "order_invalid_transition";

/**
 * Log a structured security event as JSON to stdout.
 *
 * In production, these entries should be:
 * - Written to a security-specific log file (e.g. via structured logging transport)
 * - Sent to a SIEM (Splunk, Datadog, etc.)
 * - Used to trigger alerts for CRITICAL events
 */
export function securityLog(
  eventType: SecurityEventType,
  details: Record<string, unknown>,
): void {
  const entry = {
    level: "WARN",
    timestamp: new Date().toISOString(),
    event: eventType,
    ...details,
  };

  console.log(JSON.stringify(entry));
}

// Convenience methods
export const securityLogger = {
  warn: (event: SecurityEventType, details: Record<string, unknown>) =>
    securityLog(event, details),

  critical: (event: SecurityEventType, details: Record<string, unknown>) =>
    securityLog(event, { ...details, severity: "CRITICAL" }),
};
