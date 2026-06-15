import { useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";

/**
 * Forgot Password page — requests a password reset email.
 * Matches the existing Auth.tsx luxury aesthetic and UX patterns.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      // In production, replace with actual API call
      await new Promise((r) => setTimeout(r, 1500));
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <PageTransition>
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <h1 className="heading-l text-ink mb-4">
            Check your inbox
          </h1>
          <p className="body text-dark leading-relaxed mb-8">
            If an account exists for{" "}
            <span className="text-ink font-medium">{email}</span>, you'll
            receive a password reset link shortly.
          </p>
          <Link
            to="/login"
            className="inline-block caption text-brass-gold hover:text-ink transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading-l text-ink">
            Reset your password
          </h1>
          <p className="mt-2 body text-dark leading-relaxed">
            Enter your email address and we'll send you a link to create a new
            password.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 border border-error/30 bg-error/10 px-4 py-3 body text-error"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="reset-email"
            className="block micro text-muted mb-1"
              >
                Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="w-full bg-ink text-ivory py-3.5 caption hover:bg-brass-gold disabled:opacity-50 transition-colors"
          >
            {sending ? "Sending…" : "Send reset link"}
          </button>
        </form>

        {/* Back to login */}
        <p className="mt-6 text-center text-xs text-muted">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-brass-gold hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
    </PageTransition>
  );
}
