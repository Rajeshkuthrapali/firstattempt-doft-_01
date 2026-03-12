"use client";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try { const { signIn } = await import("next-auth/react"); const result = await signIn("credentials", { email, password, redirect: false }); if (result?.error) setError("Invalid email or password"); else window.location.href = "/account"; } catch { setError("Something went wrong"); } finally { setLoading(false); }
  }
  async function handleGoogleSignIn() { const { signIn } = await import("next-auth/react"); await signIn("google", { callbackUrl: "/account" }); }
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center"><h1 className="font-heading text-3xl font-bold text-primary">Welcome Back</h1><p className="mt-2 text-text-light">Sign in to access your account</p></div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div><label className="mb-1 block text-sm font-bold uppercase tracking-wider">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-primary" placeholder="you@example.com" /></div>
          <div><label className="mb-1 block text-sm font-bold uppercase tracking-wider">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-primary" placeholder="••••••••" /></div>
          {error && <p className="text-sm text-accent">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg disabled:opacity-50">{loading ? "Signing in…" : "Sign In"}</button>
        </form>
        <div className="mt-6 flex items-center gap-4"><hr className="flex-1 border-border" /><span className="text-xs uppercase tracking-wider text-text-muted">or</span><hr className="flex-1 border-border" /></div>
        <button onClick={handleGoogleSignIn} className="mt-6 flex w-full items-center justify-center gap-3 border border-border py-3.5 text-sm font-medium hover:border-primary hover:bg-bg-secondary">Continue with Google</button>
      </div>
    </div>
  );
}
