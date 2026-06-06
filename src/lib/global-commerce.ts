/**
 * Multi-Currency & Global Payments (P9)
 *
 * Automatic FX conversion, Google Pay integration,
 * regional wallet support, and compliance localization.
 */

// ── Currency Configuration ───────────────────────────────────────────────────

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "JPY" | "SAR";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  decimalPlaces: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", decimalPlaces: 2 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", decimalPlaces: 2 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", decimalPlaces: 2 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", decimalPlaces: 2 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE", decimalPlaces: 2 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP", decimalPlaces: 0 },
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal", locale: "ar-SA", decimalPlaces: 2 },
};

// Cached exchange rates (in production, fetched from API like Open Exchange Rates)
const FX_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  JPY: 1.78,
  SAR: 0.045,
};

/** Converts an amount from INR to the target currency. */
export function convertCurrency(amountINR: number, target: CurrencyCode): number {
  const rate = FX_RATES[target];
  const converted = amountINR * rate;
  const config = CURRENCIES[target];
  return Number(converted.toFixed(config.decimalPlaces));
}

/** Formats a price in the given currency with locale-aware formatting. */
export function formatCurrencyAmount(amount: number, currency: CurrencyCode): string {
  const config = CURRENCIES[currency];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  }).format(amount);
}

/** Auto-detects user currency from browser timezone/locale. */
export function detectCurrency(): CurrencyCode {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta")) return "INR";
  if (tz.startsWith("America/")) return "USD";
  if (tz.startsWith("Europe/London")) return "GBP";
  if (tz.startsWith("Europe/")) return "EUR";
  if (tz.startsWith("Asia/Dubai") || tz.startsWith("Asia/Muscat")) return "AED";
  if (tz.startsWith("Asia/Tokyo")) return "JPY";
  if (tz.startsWith("Asia/Riyadh")) return "SAR";
  return "INR";
}

// ── Google Pay ───────────────────────────────────────────────────────────────

const GPAY_MERCHANT_ID = import.meta.env.VITE_GPAY_MERCHANT_ID as string | undefined;

export interface GooglePayConfig {
  merchantId: string;
  merchantName: string;
  environment: "TEST" | "PRODUCTION";
}

/** Checks if Google Pay is available via the Payment Request API. */
export async function isGooglePayAvailable(): Promise<boolean> {
  if (!("PaymentRequest" in window)) return false;
  try {
    const methods = [{ supportedMethods: "https://google.com/pay", data: { apiVersion: 2, apiVersionMinor: 0, allowedPaymentMethods: [{ type: "CARD", parameters: { allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"], allowedCardNetworks: ["VISA", "MASTERCARD"] } }] } }];
    const request = new PaymentRequest(methods, { total: { label: "Test", amount: { currency: "INR", value: "0.01" } } });
    return await request.canMakePayment() || false;
  } catch {
    return false;
  }
}

/** Initiates a Google Pay payment via Payment Request API. */
export async function processGooglePay(
  amount: number,
  currency: CurrencyCode,
): Promise<{ success: boolean; token?: string; error?: string }> {
  if (!GPAY_MERCHANT_ID) return { success: false, error: "Google Pay not configured" };

  try {
    const methods = [{
      supportedMethods: "https://google.com/pay",
      data: {
        apiVersion: 2, apiVersionMinor: 0,
        merchantInfo: { merchantId: GPAY_MERCHANT_ID, merchantName: "Lumière Candles" },
        allowedPaymentMethods: [{ type: "CARD", parameters: { allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"], allowedCardNetworks: ["VISA", "MASTERCARD", "AMEX"] }, tokenizationSpecification: { type: "PAYMENT_GATEWAY", parameters: { gateway: "stripe", "stripe:publishableKey": import.meta.env.VITE_STRIPE_PK || "" } } }],
      },
    }];
    const details = { total: { label: "Lumière Candles", amount: { currency, value: amount.toFixed(2) } } };
    const request = new PaymentRequest(methods, details);
    const response = await request.show();
    await response.complete("success");
    return { success: true, token: JSON.stringify(response.details) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Google Pay failed" };
  }
}

// ── Compliance Localization ──────────────────────────────────────────────────

export type ComplianceRegion = "EU" | "US_CA" | "IN" | "UAE" | "JP" | "GLOBAL";

export interface ComplianceRequirement {
  region: ComplianceRegion;
  regulation: string;
  consentRequired: boolean;
  dataRetentionDays: number;
  rightToErasure: boolean;
  cookieConsentLevel: "essential" | "functional" | "analytics" | "marketing";
  ageVerification: boolean;
}

export const COMPLIANCE_RULES: ComplianceRequirement[] = [
  { region: "EU", regulation: "GDPR", consentRequired: true, dataRetentionDays: 730, rightToErasure: true, cookieConsentLevel: "marketing", ageVerification: false },
  { region: "US_CA", regulation: "CCPA", consentRequired: true, dataRetentionDays: 365, rightToErasure: true, cookieConsentLevel: "analytics", ageVerification: false },
  { region: "IN", regulation: "DPDPA", consentRequired: true, dataRetentionDays: 1095, rightToErasure: true, cookieConsentLevel: "functional", ageVerification: false },
  { region: "UAE", regulation: "PDPL", consentRequired: true, dataRetentionDays: 730, rightToErasure: true, cookieConsentLevel: "analytics", ageVerification: false },
  { region: "JP", regulation: "APPI", consentRequired: true, dataRetentionDays: 730, rightToErasure: true, cookieConsentLevel: "analytics", ageVerification: false },
  { region: "GLOBAL", regulation: "Default", consentRequired: false, dataRetentionDays: 1825, rightToErasure: false, cookieConsentLevel: "essential", ageVerification: false },
];

/** Detects the user's compliance region from timezone. */
export function detectComplianceRegion(): ComplianceRegion {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz.startsWith("Europe/")) return "EU";
  if (tz.startsWith("America/Los_Angeles") || tz.startsWith("America/San_Francisco")) return "US_CA";
  if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta")) return "IN";
  if (tz.startsWith("Asia/Dubai")) return "UAE";
  if (tz.startsWith("Asia/Tokyo")) return "JP";
  return "GLOBAL";
}

/** Returns compliance requirements for the detected region. */
export function getComplianceRules(region?: ComplianceRegion): ComplianceRequirement {
  const r = region || detectComplianceRegion();
  return COMPLIANCE_RULES.find((c) => c.region === r) || COMPLIANCE_RULES[COMPLIANCE_RULES.length - 1];
}
