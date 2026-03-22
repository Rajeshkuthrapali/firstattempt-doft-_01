import { useState } from "react";
import { useCartStore } from "../stores/cart";
import { useCheckoutStore } from "../stores/checkout";
import { useAuthStore } from "../stores/auth";
import { trackGiftOptionSelected, trackBeginCheckout } from "../lib/analytics";
import { formatPrice } from "../lib/format";
import { Link } from "react-router-dom";
import type { GiftOptions } from "../stores/checkout";

/**
 * Enhanced Checkout page.
 * Features: order summary, gift wrapping options, personalised message,
 * and abandoned cart recovery banner.
 */
export default function Checkout() {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const { gift, setGift, showRecoveryBanner, dismissRecoveryBanner } = useCheckoutStore();
  const user = useAuthStore((s) => s.user);
  const addresses = useAuthStore((s) => s.addresses);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [step, setStep] = useState<"summary" | "shipping" | "payment">("summary");

  const GIFT_PRICES: Record<GiftOptions["wrapping"], number> = {
    none: 0,
    standard: 99,
    premium: 249,
  };
  const giftSurcharge = gift.enabled ? GIFT_PRICES[gift.wrapping] : 0;
  const grandTotal = totalPrice + giftSurcharge;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-[#9a8d82] text-sm">Your cart is empty.</p>
        <Link to="/" className="text-xs uppercase tracking-widest text-[#c4a093] hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* ── Abandoned Cart Recovery Banner ── */}
      {showRecoveryBanner && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded bg-[#fdf6f3] border border-[#e8d8d0] px-5 py-4"
        >
          <div>
            <p className="text-sm font-medium text-[#2d2926]">
              Welcome back! You left something behind. 🕯️
            </p>
            <p className="text-xs text-[#9a8d82] mt-0.5">Your cart has been saved — ready to complete your order?</p>
          </div>
          <button
            onClick={dismissRecoveryBanner}
            className="ml-4 text-[#9a8d82] hover:text-[#2d2926] transition-colors"
            aria-label="Dismiss recovery banner"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-semibold text-[#2d2926] mb-8">
        Checkout
      </h1>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* ── Left: Steps ── */}
        <div className="lg:col-span-3 space-y-8">

          {/* Step indicator */}
          <ol className="flex gap-6 text-xs uppercase tracking-widest" aria-label="Checkout steps">
            {(["summary", "shipping", "payment"] as const).map((s, i) => (
              <li key={s} className={`flex items-center gap-2 ${step === s ? "text-[#c4a093] font-semibold" : "text-[#9a8d82]"}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s ? "bg-[#c4a093] text-white" : "bg-[#e8e0d8] text-[#9a8d82]"}`}>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>

          {/* Cart summary */}
          {step === "summary" && (
            <section aria-labelledby="summary-heading">
              <h2 id="summary-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4">
                Your Items
              </h2>
              <ul className="space-y-4" role="list">
                {items.map(({ product, qty }) => (
                  <li key={product.id} className="flex gap-4 items-center">
                    <img src={product.image} alt={product.name} className="h-16 w-16 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2d2926] truncate">{product.name}</p>
                      <p className="text-xs text-[#9a8d82]">Qty: {qty}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#2d2926]">{formatPrice(product.price * qty)}</p>
                  </li>
                ))}
              </ul>

              {/* Gift Wrap */}
              <div className="mt-8 rounded border border-[#e8e0d8] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    id="gift-wrap-toggle"
                    type="checkbox"
                    checked={gift.enabled}
                    onChange={(e) => {
                      setGift({ enabled: e.target.checked });
                      if (e.target.checked) trackGiftOptionSelected(gift.wrapping, !!gift.message);
                    }}
                    className="accent-[#c4a093] h-4 w-4"
                  />
                  <label htmlFor="gift-wrap-toggle" className="text-sm font-medium text-[#2d2926] cursor-pointer">
                    Add Gift Wrapping 🎁
                  </label>
                </div>

                {gift.enabled && (
                  <div className="space-y-4 animate-in">
                    <fieldset>
                      <legend className="text-xs font-medium uppercase tracking-widest text-[#9a8d82] mb-2">
                        Wrapping Style
                      </legend>
                      <div className="grid grid-cols-3 gap-2">
                        {(["none", "standard", "premium"] as const).map((w) => (
                          <label
                            key={w}
                            className={`rounded border p-3 text-center cursor-pointer transition-colors ${gift.wrapping === w ? "border-[#c4a093] bg-[#fdf6f3]" : "border-[#e8e0d8] hover:border-[#c4a093]"}`}
                          >
                            <input
                              type="radio"
                              name="wrapping"
                              value={w}
                              checked={gift.wrapping === w}
                              onChange={() => { setGift({ wrapping: w }); trackGiftOptionSelected(w, !!gift.message); }}
                              className="sr-only"
                            />
                            <span className="block text-xs font-semibold capitalize text-[#2d2926]">{w}</span>
                            <span className="block text-[10px] text-[#9a8d82]">
                              {w === "none" ? "Free" : `+${formatPrice(GIFT_PRICES[w])}`}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div>
                      <label htmlFor="gift-message" className="block text-xs font-medium uppercase tracking-widest text-[#9a8d82] mb-1">
                        Personal Message <span className="normal-case">(optional, max 200 chars)</span>
                      </label>
                      <textarea
                        id="gift-message"
                        maxLength={200}
                        rows={3}
                        value={gift.message}
                        onChange={(e) => setGift({ message: e.target.value })}
                        placeholder="Write a heartfelt message for the recipient…"
                        className="w-full border border-[#e8e0d8] bg-white px-4 py-3 text-sm text-[#2d2926] placeholder:text-[#c4b8b0] outline-none focus:border-[#c4a093] transition-colors rounded-sm resize-none"
                      />
                      <p className="mt-1 text-right text-[10px] text-[#9a8d82]">{gift.message.length}/200</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setStep("shipping"); trackBeginCheckout(items.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.qty })), grandTotal); }}
                className="mt-6 w-full bg-[#2d2926] text-white py-4 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#c4a093] transition-colors rounded-sm"
              >
                Continue to Shipping
              </button>
            </section>
          )}

          {step === "shipping" && (
            <section aria-labelledby="shipping-heading">
              <h2 id="shipping-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4">
                Shipping Address
              </h2>
              {!user ? (
                <p className="text-sm text-[#6b5e54]">
                  <Link to="/auth" className="text-[#c4a093] hover:underline">Sign in</Link> to use saved addresses, or fill in below.
                </p>
              ) : defaultAddress ? (
                <div className="rounded border border-[#c4a093] p-4 mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#c4a093] mb-1">Using default address</p>
                  <p className="text-sm text-[#6b5e54] leading-relaxed">
                    {defaultAddress.name}<br />
                    {defaultAddress.line1}, {defaultAddress.city}, {defaultAddress.state}
                  </p>
                </div>
              ) : null}
              <button
                onClick={() => setStep("payment")}
                className="mt-4 w-full bg-[#2d2926] text-white py-4 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#c4a093] transition-colors rounded-sm"
              >
                Continue to Payment
              </button>
            </section>
          )}

          {step === "payment" && (
            <section aria-labelledby="payment-heading">
              <h2 id="payment-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4">
                Payment
              </h2>
              <div className="rounded border border-[#e8e0d8] p-6 text-center text-sm text-[#9a8d82]">
                Payment gateway integration (Razorpay / Stripe) is handled by the server API.
                This scaffold connects to <code className="text-[#c4a093]">{import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"}/payments/initiate</code>.
              </div>
            </section>
          )}
        </div>

        {/* ── Right: Order summary ── */}
        <aside className="lg:col-span-2" aria-label="Order total">
          <div className="rounded border border-[#e8e0d8] p-6 sticky top-32">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4">Order Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#6b5e54]">Subtotal</dt>
                <dd className="font-medium text-[#2d2926]">{formatPrice(totalPrice)}</dd>
              </div>
              {gift.enabled && gift.wrapping !== "none" && (
                <div className="flex justify-between">
                  <dt className="text-[#6b5e54]">Gift Wrapping ({gift.wrapping})</dt>
                  <dd className="font-medium text-[#2d2926]">+{formatPrice(giftSurcharge)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[#6b5e54]">Shipping</dt>
                <dd className="font-medium text-green-600">{totalPrice >= 3000 ? "Free" : formatPrice(99)}</dd>
              </div>
              <div className="border-t border-[#e8e0d8] pt-2 flex justify-between text-base font-semibold">
                <dt className="text-[#2d2926]">Total</dt>
                <dd className="text-[#2d2926]">{formatPrice(grandTotal + (totalPrice < 3000 ? 99 : 0))}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
