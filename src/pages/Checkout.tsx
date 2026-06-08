import { useState } from "react";
import { useCartStore } from "../stores/cart";
import { useCheckoutStore } from "../stores/checkout";
import { useAuthStore } from "../stores/auth";
import { trackBeginCheckout } from "../lib/analytics";
import { formatPrice } from "../lib/format";
import { Link } from "react-router-dom";
import OrderSummary from "../components/checkout/OrderSummary";
import GiftOptions from "../components/checkout/GiftOptions";

const GIFT_PRICES: Record<string, number> = {
  none: 0,
  standard: 99,
  premium: 249,
};

export default function Checkout() {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const { gift, setGift, showRecoveryBanner, dismissRecoveryBanner } =
    useCheckoutStore();
  const user = useAuthStore((s) => s.user);
  const addresses = useAuthStore((s) => s.addresses);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [step, setStep] = useState<"summary" | "shipping" | "payment">("summary");

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
      {/* Abandoned Cart Recovery Banner */}
      {showRecoveryBanner && (
        <div role="alert" className="mb-6 flex items-center justify-between rounded bg-[#fdf6f3] border border-[#e8d8d0] px-5 py-4">
          <div>
            <p className="text-sm font-medium text-[#2d2926]">Welcome back! You left something behind. 🕯️</p>
            <p className="text-xs text-[#9a8d82] mt-0.5">Your cart has been saved — ready to complete your order?</p>
          </div>
          <button onClick={dismissRecoveryBanner} className="ml-4 text-[#9a8d82] hover:text-[#2d2926] transition-colors" aria-label="Dismiss recovery banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-semibold text-[#2d2926] mb-8">Checkout</h1>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Left: Steps */}
        <div className="lg:col-span-3 space-y-8">
          {/* Step indicator */}
          <ol className="flex gap-6 text-xs uppercase tracking-widest" aria-label="Checkout steps">
            {(["summary", "shipping", "payment"] as const).map((s, i) => (
              <li key={s} className={`flex items-center gap-2 ${step === s ? "text-[#c4a093] font-semibold" : "text-[#9a8d82]"}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s ? "bg-[#c4a093] text-white" : "bg-[#e8e0d8] text-[#9a8d82]"}`}>
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>

          {/* Summary Step */}
          {step === "summary" && (
            <section aria-labelledby="summary-heading">
              <h2 id="summary-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4">
                Your Items
              </h2>
              <ul className="space-y-4" role="list">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-4 items-center">
                    <img src={item.image} alt={item.title} className="h-16 w-16 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2d2926] truncate">{item.title}</p>
                      <p className="text-xs text-[#9a8d82]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#2d2926]">{formatPrice(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>

              <GiftOptions gift={gift} setGift={setGift} />

              <button
                onClick={() => {
                  setStep("shipping");
                  trackBeginCheckout(
                    items.map((i) => ({ id: i.variantId, name: i.title, price: i.price, quantity: i.quantity })),
                    grandTotal,
                  );
                }}
                className="mt-6 w-full bg-[#2d2926] text-white py-4 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#c4a093] transition-colors rounded-sm"
              >
                Continue to Shipping
              </button>
            </section>
          )}

          {/* Shipping Step */}
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
                    {defaultAddress.name}<br />{defaultAddress.line1}, {defaultAddress.city}, {defaultAddress.state}
                  </p>
                </div>
              ) : null}
              <button onClick={() => setStep("payment")} className="mt-4 w-full bg-[#2d2926] text-white py-4 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#c4a093] transition-colors rounded-sm">
                Continue to Payment
              </button>
            </section>
          )}

          {/* Payment Step */}
          {step === "payment" && (
            <section aria-labelledby="payment-heading">
              <h2 id="payment-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4">Payment</h2>
              <div className="rounded border border-[#e8e0d8] p-6 text-center text-sm text-[#9a8d82]">
                Payment gateway integration (Razorpay / Stripe) is handled by the server API.
              </div>
            </section>
          )}
        </div>

        {/* Right: Order Summary */}
        <OrderSummary totalPrice={totalPrice} gift={gift} giftSurcharge={giftSurcharge} grandTotal={grandTotal} />
      </div>
    </div>
  );
}
