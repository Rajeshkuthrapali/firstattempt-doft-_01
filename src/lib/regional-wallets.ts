/**
 * Global Regional Wallet Integrations (P10)
 *
 * Provider-agnostic payment layer for:
 * - Alipay (China + global)
 * - WeChat Pay (China)
 * - Paytm (India)
 * - PhonePe (India)
 * - GrabPay (Southeast Asia)
 *
 * Includes multi-tenant loyalty federation across partner brands.
 */

export type RegionalWallet = "alipay" | "wechatpay" | "paytm" | "phonepe" | "grabpay";

export interface WalletPaymentIntent {
  wallet: RegionalWallet;
  amount: number;
  currency: string;
  orderId: string;
  returnUrl: string;
  metadata: Record<string, string>;
}

export interface WalletPaymentResult {
  success: boolean;
  wallet: RegionalWallet;
  transactionId: string;
  redirectUrl?: string;
  qrCodeUrl?: string;
  error?: string;
}

interface WalletConfig {
  name: string;
  currencies: string[];
  regions: string[];
  flowType: "redirect" | "qr" | "sdk";
  apiEndpoint: string;
}

const WALLET_CONFIGS: Record<RegionalWallet, WalletConfig> = {
  alipay: {
    name: "Alipay",
    currencies: ["CNY", "USD", "EUR", "GBP", "INR"],
    regions: ["CN", "HK", "SG", "MY", "AU", "US", "GB"],
    flowType: "redirect",
    apiEndpoint: "/api/payments/alipay",
  },
  wechatpay: {
    name: "WeChat Pay",
    currencies: ["CNY", "HKD"],
    regions: ["CN", "HK"],
    flowType: "qr",
    apiEndpoint: "/api/payments/wechat",
  },
  paytm: {
    name: "Paytm",
    currencies: ["INR"],
    regions: ["IN"],
    flowType: "sdk",
    apiEndpoint: "/api/payments/paytm",
  },
  phonepe: {
    name: "PhonePe",
    currencies: ["INR"],
    regions: ["IN"],
    flowType: "redirect",
    apiEndpoint: "/api/payments/phonepe",
  },
  grabpay: {
    name: "GrabPay",
    currencies: ["SGD", "MYR", "THB", "PHP", "IDR", "VND"],
    regions: ["SG", "MY", "TH", "PH", "ID", "VN"],
    flowType: "redirect",
    apiEndpoint: "/api/payments/grabpay",
  },
};

/** Returns wallets available for a given region and currency. */
export function getAvailableWallets(region: string, currency: string): RegionalWallet[] {
  return (Object.entries(WALLET_CONFIGS) as [RegionalWallet, WalletConfig][])
    .filter(([, cfg]) => cfg.regions.includes(region) && cfg.currencies.includes(currency))
    .map(([wallet]) => wallet);
}

/** Returns human-readable display name for a wallet. */
export function getWalletName(wallet: RegionalWallet): string {
  return WALLET_CONFIGS[wallet].name;
}

/**
 * Initiates a regional wallet payment.
 * Returns a redirect URL or QR code URL depending on wallet flow type.
 */
export async function initiateWalletPayment(intent: WalletPaymentIntent): Promise<WalletPaymentResult> {
  const config = WALLET_CONFIGS[intent.wallet];
  try {
    const res = await fetch(config.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: intent.amount, currency: intent.currency, orderId: intent.orderId, returnUrl: intent.returnUrl, metadata: intent.metadata }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, wallet: intent.wallet, transactionId: data.transactionId, redirectUrl: data.redirectUrl, qrCodeUrl: data.qrCodeUrl };
  } catch (err) {
    return { success: false, wallet: intent.wallet, transactionId: "", error: err instanceof Error ? err.message : `${config.name} payment failed` };
  }
}

// ── Multi-Tenant Loyalty Federation ──────────────────────────────────────────

export interface LoyaltyPartnerBrand {
  partnerId: string;
  brandName: string;
  logoUrl: string;
  pointsLabel: string;
  conversionRateToLumiere: number;
  conversionRateFromLumiere: number;
  supportedTiers: string[];
  categories: string[];
}

export interface FederatedRedemption {
  userId: string;
  sourcePartnerId: string;
  targetPartnerId: string;
  sourcePoints: number;
  convertedPoints: number;
  transactionId: string;
  timestamp: string;
}

const PARTNER_REGISTRY = new Map<string, LoyaltyPartnerBrand>();

/** Registers a loyalty partner in the federation network. */
export function registerPartnerBrand(partner: LoyaltyPartnerBrand): void {
  PARTNER_REGISTRY.set(partner.partnerId, partner);
}

/** Returns all registered partner brands. */
export function getPartnerBrands(): LoyaltyPartnerBrand[] {
  return Array.from(PARTNER_REGISTRY.values());
}

/** Calculates converted points between two partners via Lumière as intermediary. */
export function calculateFederatedConversion(
  sourcePartnerId: string,
  targetPartnerId: string,
  sourcePoints: number,
): { convertedPoints: number; rate: number } | null {
  const source = PARTNER_REGISTRY.get(sourcePartnerId);
  const target = PARTNER_REGISTRY.get(targetPartnerId);
  if (!source || !target) return null;
  const lumierePoints = Math.floor(sourcePoints / source.conversionRateToLumiere);
  const convertedPoints = Math.floor(lumierePoints * target.conversionRateFromLumiere);
  return { convertedPoints, rate: Math.round((convertedPoints / sourcePoints) * 1000) / 1000 };
}

/** Executes a federated loyalty redemption across partner brands. */
export async function executeFederatedRedemption(
  userId: string,
  sourcePartnerId: string,
  targetPartnerId: string,
  sourcePoints: number,
): Promise<FederatedRedemption | null> {
  const conversion = calculateFederatedConversion(sourcePartnerId, targetPartnerId, sourcePoints);
  if (!conversion) return null;
  try {
    const res = await fetch("/api/loyalty/federation/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, sourcePartnerId, targetPartnerId, sourcePoints, convertedPoints: conversion.convertedPoints }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { userId, sourcePartnerId, targetPartnerId, sourcePoints, convertedPoints: conversion.convertedPoints, transactionId: data.transactionId, timestamp: new Date().toISOString() };
  } catch { return null; }
}

// ── Seed default partners ─────────────────────────────────────────────────────

registerPartnerBrand({ partnerId: "indigo-airlines", brandName: "IndiGo BluChip", logoUrl: "/partners/indigo.png", pointsLabel: "BluChip Points", conversionRateToLumiere: 5, conversionRateFromLumiere: 3, supportedTiers: ["Silver", "Gold", "Platinum"], categories: ["travel"] });
registerPartnerBrand({ partnerId: "taj-hotels", brandName: "Taj InnerCircle", logoUrl: "/partners/taj.png", pointsLabel: "InnerCircle Points", conversionRateToLumiere: 2, conversionRateFromLumiere: 1.5, supportedTiers: ["Gold", "Platinum"], categories: ["hospitality"] });
registerPartnerBrand({ partnerId: "tata-neucoins", brandName: "NeuCoin", logoUrl: "/partners/tata.png", pointsLabel: "NeuCoins", conversionRateToLumiere: 1, conversionRateFromLumiere: 1, supportedTiers: ["Bronze", "Silver", "Gold", "Platinum"], categories: ["retail"] });
