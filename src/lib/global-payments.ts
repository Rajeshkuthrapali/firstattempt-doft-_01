/**
 * Global Payment Gateways (P8)
 *
 * Provider-agnostic payment integration layer supporting:
 * - Stripe (existing, primary)
 * - PayPal (global markets)
 * - Apple Pay (iOS/macOS)
 * - Cross-brand loyalty redemption
 */

export type PaymentProvider = "stripe" | "paypal" | "applepay";

export interface PaymentIntent {
  amount: number;
  currency: string;
  provider: PaymentProvider;
  metadata: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  provider: PaymentProvider;
  error?: string;
}

// ── PayPal Integration ───────────────────────────────────────────────────────

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;

/**
 * Creates a PayPal order for the given amount.
 * In production, order creation happens server-side.
 */
export async function createPayPalOrder(
  amount: number,
  currency = "INR",
): Promise<string | null> {
  if (!PAYPAL_CLIENT_ID) {
    console.warn("[PayPal] No client ID configured");
    return null;
  }

  try {
    const res = await fetch("/api/payments/paypal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency }),
    });
    if (!res.ok) return null;
    const { orderId } = await res.json();
    return orderId;
  } catch {
    console.error("[PayPal] Order creation failed");
    return null;
  }
}

/**
 * Captures a PayPal payment after buyer approval.
 */
export async function capturePayPalPayment(orderId: string): Promise<PaymentResult> {
  try {
    const res = await fetch(`/api/payments/paypal/capture/${orderId}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      transactionId: data.transactionId,
      provider: "paypal",
    };
  } catch (err) {
    return {
      success: false,
      transactionId: "",
      provider: "paypal",
      error: err instanceof Error ? err.message : "PayPal capture failed",
    };
  }
}

// ── Apple Pay Integration ────────────────────────────────────────────────────

/**
 * Checks if Apple Pay is available on the current device.
 */
export function isApplePayAvailable(): boolean {
  return !!(window as unknown as { ApplePaySession?: { canMakePayments(): boolean } })
    .ApplePaySession?.canMakePayments();
}

/**
 * Initiates an Apple Pay payment session.
 */
export async function startApplePaySession(
  amount: number,
  currency = "INR",
  label = "Lumière Candles",
): Promise<PaymentResult> {
  const ApplePaySession = (window as unknown as { ApplePaySession: new (version: number, req: unknown) => unknown }).ApplePaySession;
  if (!ApplePaySession) {
    return { success: false, transactionId: "", provider: "applepay", error: "Apple Pay not supported" };
  }

  const request = {
    countryCode: "IN",
    currencyCode: currency,
    supportedNetworks: ["visa", "masterCard", "amex"],
    merchantCapabilities: ["supports3DS"],
    total: { label, amount: (amount / 100).toFixed(2) },
  };

  try {
    // Server-side validation is required for Apple Pay
    const res = await fetch("/api/payments/applepay/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error("Session creation failed");
    const { transactionId } = await res.json();
    return { success: true, transactionId, provider: "applepay" };
  } catch (err) {
    return {
      success: false,
      transactionId: "",
      provider: "applepay",
      error: err instanceof Error ? err.message : "Apple Pay failed",
    };
  }
}

// ── Unified Payment Router ───────────────────────────────────────────────────

/**
 * Routes payment to the appropriate provider.
 * Selects provider based on availability and user preference.
 */
export async function processPayment(intent: PaymentIntent): Promise<PaymentResult> {
  switch (intent.provider) {
    case "paypal": {
      const orderId = await createPayPalOrder(intent.amount, intent.currency);
      if (!orderId) return { success: false, transactionId: "", provider: "paypal", error: "Order creation failed" };
      return capturePayPalPayment(orderId);
    }
    case "applepay":
      return startApplePaySession(intent.amount, intent.currency);
    case "stripe":
    default:
      // Existing Stripe flow via server-side intent creation
      try {
        const res = await fetch("/api/payments/stripe/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intent),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { clientSecret, transactionId } = await res.json();
        return { success: !!clientSecret, transactionId, provider: "stripe" };
      } catch (err) {
        return {
          success: false,
          transactionId: "",
          provider: "stripe",
          error: err instanceof Error ? err.message : "Stripe failed",
        };
      }
  }
}

/**
 * Returns available payment providers for the user's device/region.
 */
export function getAvailableProviders(): PaymentProvider[] {
  const providers: PaymentProvider[] = ["stripe"];
  if (PAYPAL_CLIENT_ID) providers.push("paypal");
  if (isApplePayAvailable()) providers.push("applepay");
  return providers;
}

// ── Cross-Brand Loyalty Redemption ───────────────────────────────────────────

export interface CrossBrandRedemption {
  sourcePartnerId: string;
  targetPartnerId: string;
  userId: string;
  sourcePoints: number;
  conversionRate: number;
}

/**
 * Converts loyalty points from one partner to another.
 * E.g., airline miles → Lumière points at configured exchange rate.
 */
export async function redeemCrossBrand(redemption: CrossBrandRedemption): Promise<{
  success: boolean;
  convertedPoints: number;
  error?: string;
}> {
  const convertedPoints = Math.floor(redemption.sourcePoints * redemption.conversionRate);

  try {
    const res = await fetch("/api/loyalty/cross-redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...redemption,
        convertedPoints,
        timestamp: new Date().toISOString(),
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { success: true, convertedPoints };
  } catch (err) {
    return {
      success: false,
      convertedPoints: 0,
      error: err instanceof Error ? err.message : "Redemption failed",
    };
  }
}
