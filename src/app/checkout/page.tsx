"use client";
import { useCartStore } from "@/lib/store/cart";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, totalItems } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })), email: email || undefined }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Checkout failed"); setLoading(false); return; }
      if (data.url) window.location.href = data.url;
    } catch { setError("Network error. Please try again."); setLoading(false); }
  }

  if (items.length === 0) return <div className="mx-auto max-w-2xl px-6 py-20 text-center"><h1 className="font-heading text-3xl font-bold text-primary">Checkout</h1><p className="mt-4 text-text-muted">Your cart is empty.</p><Link href="/collections/bestsellers" className="mt-6 inline-block border border-primary px-8 py-3 text-sm font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white">Shop Now</Link></div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 font-heading text-3xl font-bold text-primary">Checkout</h1>
      <div className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold uppercase tracking-wider">Order Summary</h2>
          <ul className="divide-y divide-border">{items.map((item) => (
            <li key={item.variantId} className="flex gap-4 py-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-bg-secondary"><Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" /></div>
              <div className="flex flex-1 justify-between"><div><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-text-muted">Qty: {item.quantity}</p></div><p className="text-sm font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p></div>
            </li>
          ))}</ul>
        </div>
        <div className="lg:col-span-2">
          <div className="border border-border bg-bg-secondary p-6">
            <h2 className="mb-4 text-lg font-bold uppercase tracking-wider">Payment</h2>
            <label className="mb-4 block"><span className="mb-1 block text-sm text-text-light">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-primary" /></label>
            <div className="mb-4 flex justify-between border-t border-border pt-4 text-lg font-bold"><span>Total</span><span className="text-primary">${totalPrice().toFixed(2)}</span></div>
            {error && <p className="mb-4 text-sm text-accent">{error}</p>}
            <button onClick={handleCheckout} disabled={loading} className="w-full bg-primary py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:bg-accent disabled:opacity-50">{loading ? "Processing…" : "Pay with Stripe"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
