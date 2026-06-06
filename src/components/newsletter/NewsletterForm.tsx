"use client";
import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          disabled={status === "loading"}
          className="flex-1 border border-[#444] bg-transparent px-4 py-2.5 text-sm text-white placeholder-[#666] outline-none focus:border-gold disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-gold px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-[#111] transition-colors hover:bg-gold-dark disabled:opacity-50"
        >
          {status === "loading" ? "Joining…" : "Join"}
        </button>
      </form>
      {status === "success" && (
        <p className="mt-3 text-sm text-green-400">{message}</p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">{message}</p>
      )}
    </div>
  );
}
