import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { trackAccountCreated } from "../lib/analytics";
import PageTransition from "../components/PageTransition";

type Mode = "login" | "register";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

/**
 * Validate email format.
 */
function isValidEmail(v: string): boolean {
  return EMAIL_RE.test(v);
}

/**
 * Client-side password strength check:
 * - minimum 8 characters
 * - at least one letter
 * - at least one digit
 */
function isStrongPassword(v: string): boolean {
  return PASSWORD_RE.test(v);
}

/**
 * Authentication page — Login & Registration.
 * Supports email/password and Google OAuth (when VITE_GOOGLE_CLIENT_ID is set).
 * WCAG AA compliant: labelled inputs, error announcements, focus management.
 */
export default function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const { login, register, loginWithGoogle, isLoading, error, clearError } =
    useAuthStore();
  const navigate = useNavigate();

  function validate(): FormErrors {
    const errors: FormErrors = {};

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (!isStrongPassword(password)) {
      errors.password =
        "Must be at least 8 characters with at least one letter and one number.";
    }

    if (mode === "register") {
      if (!name.trim()) {
        errors.name = "Full name is required.";
      }

      if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }

      if (!termsAccepted) {
        errors.terms = "You must accept the terms & conditions.";
      }
    }

    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (mode === "login") {
      await login(email, password);
    } else {
      await register(name, email, password);
      trackAccountCreated("email");
    }
    const user = useAuthStore.getState().user;
    if (user) navigate("/account");
  }

  function switchMode(m: Mode) {
    setMode(m);
    clearError();
    setFormErrors({});
  }

  return (
    <PageTransition>
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading-l text-ink">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mt-2 body text-dark">
            {mode === "login"
              ? "Sign in to access your orders and wishlist."
              : "Join Lumière for exclusive access and early launches."}
          </p>
        </div>

        {/* Error */}
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
          {/* ── Full Name (register only) ── */}
          {mode === "register" && (
            <div>
              <label
                htmlFor="auth-name"
                className="block micro text-muted mb-1"
              >
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) setFormErrors((p) => ({ ...p, name: undefined }));
                }}
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? "auth-name-error" : undefined}
                className="w-full border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink transition-colors"
                placeholder="Priya Sharma"
              />
              {formErrors.name && (
                <p id="auth-name-error" role="alert" className="mt-1 text-xs text-error">
                  {formErrors.name}
                </p>
              )}
            </div>
          )}

          {/* ── Email ── */}
          <div>
            <label
              htmlFor="auth-email"
              className="block micro text-muted mb-1"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors((p) => ({ ...p, email: undefined }));
              }}
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? "auth-email-error" : undefined}
              className="w-full border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink transition-colors"
              placeholder="you@example.com"
            />
            {formErrors.email && (
              <p id="auth-email-error" role="alert" className="mt-1 text-xs text-error">
                {formErrors.email}
              </p>
            )}
          </div>

          {/* ── Password ── */}
          <div>
            <label
              htmlFor="auth-password"
              className="block micro text-muted mb-1"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors((p) => ({ ...p, password: undefined }));
              }}
              aria-invalid={!!formErrors.password}
              aria-describedby={formErrors.password ? "auth-password-error" : undefined}
              className="w-full border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink transition-colors"
              placeholder="••••••••"
            />
            {formErrors.password && (
              <p id="auth-password-error" role="alert" className="mt-1 text-xs text-error">
                {formErrors.password}
              </p>
            )}
          </div>

          {/* ── Confirm Password (register only) ── */}
          {mode === "register" && (
            <div>
              <label
                htmlFor="auth-confirm-password"
                className="block micro text-muted mb-1"
              >
                Confirm Password
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) setFormErrors((p) => ({ ...p, confirmPassword: undefined }));
                }}
                aria-invalid={!!formErrors.confirmPassword}
                aria-describedby={formErrors.confirmPassword ? "auth-confirm-password-error" : undefined}
                className="w-full border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink transition-colors"
                placeholder="••••••••"
              />
              {formErrors.confirmPassword && (
                <p id="auth-confirm-password-error" role="alert" className="mt-1 text-xs text-error">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* ── Terms checkbox (register only) ── */}
          {mode === "register" && (
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (formErrors.terms) setFormErrors((p) => ({ ...p, terms: undefined }));
                  }}
                  aria-invalid={!!formErrors.terms}
                  aria-describedby={formErrors.terms ? "auth-terms-error" : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brass-gold"
                />
                <span className="text-xs text-dark leading-relaxed">
                  I agree to the{" "}
                  <Link
                    to="/policy/terms"
                    className="text-brass-gold hover:underline"
                    tabIndex={-1}
                  >
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/policy/privacy"
                    className="text-brass-gold hover:underline"
                    tabIndex={-1}
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {formErrors.terms && (
                <p id="auth-terms-error" role="alert" className="mt-1 text-xs text-error">
                  {formErrors.terms}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-ink text-ivory py-3.5 caption hover:bg-brass-gold disabled:opacity-50 transition-colors"
          >
            {isLoading
              ? "Please wait…"
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 border-t border-hairline" />
          <span className="micro text-muted">
            or
          </span>
          <div className="flex-1 border-t border-hairline" />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 border border-hairline bg-white py-3 text-sm text-ink hover:border-brass-gold transition-colors"
          aria-label="Continue with Google"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Toggle mode */}
        <p className="mt-6 text-center text-xs text-muted">
          {mode === "login" ? "New to Lumière? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="text-brass-gold hover:underline font-medium"
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>

        {mode === "login" && (
          <p className="mt-2 text-center text-xs text-muted">
            <Link
              to="/forgot-password"
              className="text-brass-gold hover:underline"
            >
              Forgot your password?
            </Link>
          </p>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
