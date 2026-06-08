/**
 * Base domain error class for all business-logic errors.
 * Carries an HTTP status code and optional error code for client-side handling.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}
