import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { trackAccountCreated } from "../lib/analytics";

type Mode = "login" | "register";

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
  const { login, register, loginWithGoogle, isLoading, error, clearError } =
    useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (mode === "login") {
      await login(email, password);
    } else {
      await register(name, email, password);
      trackAccountCreated("email");
    }
    const user = useAuthStore.getState().user;
    if (user) navigate("/account");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-semibold text-[#2d2926] tracking-wide">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mt-2 text-sm text-[#6b5e54]">
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
            className="mb-4 rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === "register" && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-xs font-medium uppercase tracking-widest text-[#9a8d82] mb-1"
              >
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#e8e0d8] bg-white px-4 py-3 text-sm text-[#2d2926] placeholder:text-[#c4b8b0] outline-none focus:border-[#c4a093] transition-colors rounded-sm"
                placeholder="Priya Sharma"
              />
            </div>
          )}
          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-medium uppercase tracking-widest text-[#9a8d82] mb-1"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#e8e0d8] bg-white px-4 py-3 text-sm text-[#2d2926] placeholder:text-[#c4b8b0] outline-none focus:border-[#c4a093] transition-colors rounded-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-medium uppercase tracking-widest text-[#9a8d82] mb-1"
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
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#e8e0d8] bg-white px-4 py-3 text-sm text-[#2d2926] placeholder:text-[#c4b8b0] outline-none focus:border-[#c4a093] transition-colors rounded-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2d2926] text-white py-3.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#c4a093] disabled:opacity-50 transition-colors rounded-sm"
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
          <div className="flex-1 border-t border-[#e8e0d8]" />
          <span className="text-xs text-[#9a8d82] uppercase tracking-widest">
            or
          </span>
          <div className="flex-1 border-t border-[#e8e0d8]" />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 border border-[#e8e0d8] bg-white py-3 text-sm text-[#2d2926] hover:border-[#c4a093] transition-colors rounded-sm"
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
        <p className="mt-6 text-center text-xs text-[#9a8d82]">
          {mode === "login" ? "New to Lumière? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              clearError();
            }}
            className="text-[#c4a093] hover:underline font-medium"
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>

        {mode === "login" && (
          <p className="mt-2 text-center text-xs text-[#9a8d82]">
            <Link
              to="/forgot-password"
              className="text-[#c4a093] hover:underline"
            >
              Forgot your password?
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
