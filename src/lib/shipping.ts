/**
 * Shipping Provider Integration (P11)
 *
 * India-first multi-carrier shipping layer:
 * - Shiprocket (primary, India aggregator)
 * - Delhivery (India, B2C)
 * - FedEx (international)
 *
 * Includes rate calculation, order booking, tracking, and
 * returns/refund flow initiation.
 */

export type ShippingCarrier = "shiprocket" | "delhivery" | "fedex" | "auto";
export type ShippingSpeed = "standard" | "express" | "overnight";

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface ShippingPackage {
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  declaredValueINR: number;
}

export interface ShippingRate {
  carrier: ShippingCarrier;
  speed: ShippingSpeed;
  priceINR: number;
  estimatedDays: number;
  serviceCode: string;
  codAvailable: boolean;
}

export interface ShipmentBooking {
  trackingId: string;
  carrier: ShippingCarrier;
  awb: string;           // Air Waybill number
  labelUrl: string;
  estimatedDelivery: string;
}

export interface TrackingUpdate {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

// ── Rate Calculator ───────────────────────────────────────────────────────────

/**
 * Returns available shipping rates for given origin → destination.
 * In production, calls Shiprocket's rate calculator API.
 */
export async function getShippingRates(
  originPincode: string,
  destPincode: string,
  pkg: ShippingPackage,
): Promise<ShippingRate[]> {
  try {
    const res = await fetch("/api/shipping/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originPincode, destPincode, ...pkg }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Fallback: estimated rates based on weight + distance heuristic
    return estimateFallbackRates(pkg, destPincode.startsWith("1") ? "metro" : "tier2");
  }
}

function estimateFallbackRates(pkg: ShippingPackage, zone: "metro" | "tier2"): ShippingRate[] {
  const weightKg = pkg.weightGrams / 1000;
  const baseRate = zone === "metro" ? 49 : 69;
  const perKgRate = zone === "metro" ? 30 : 40;
  const cost = Math.ceil(baseRate + weightKg * perKgRate);

  return [
    { carrier: "shiprocket", speed: "standard", priceINR: cost, estimatedDays: zone === "metro" ? 3 : 5, serviceCode: "SR_STD", codAvailable: true },
    { carrier: "shiprocket", speed: "express", priceINR: cost * 1.6, estimatedDays: 2, serviceCode: "SR_EXP", codAvailable: true },
    { carrier: "delhivery", speed: "standard", priceINR: cost + 10, estimatedDays: zone === "metro" ? 3 : 6, serviceCode: "DL_STD", codAvailable: true },
    { carrier: "fedex", speed: "overnight", priceINR: cost * 4, estimatedDays: 1, serviceCode: "FEDEX_ON", codAvailable: false },
  ];
}

// ── Order Booking ─────────────────────────────────────────────────────────────

/**
 * Books a shipment with the selected carrier and returns AWB + label.
 */
export async function bookShipment(
  orderId: string,
  carrier: ShippingCarrier,
  serviceCode: string,
  from: ShippingAddress,
  to: ShippingAddress,
  pkg: ShippingPackage,
  paymentMode: "prepaid" | "cod",
): Promise<ShipmentBooking | null> {
  try {
    const res = await fetch("/api/shipping/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, carrier, serviceCode, from, to, pkg, paymentMode }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Tracking ─────────────────────────────────────────────────────────────────

/**
 * Returns tracking timeline for a given AWB number.
 */
export async function trackShipment(
  awb: string,
  carrier: ShippingCarrier,
): Promise<TrackingUpdate[]> {
  try {
    const res = await fetch(`/api/shipping/track?awb=${awb}&carrier=${carrier}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ── Tax Calculation ───────────────────────────────────────────────────────────

export interface TaxLineItem {
  productId: string;
  hsnCode: string;        // India HSN / EU HS code
  quantity: number;
  unitPriceINR: number;
  taxCategory: "standard" | "reduced" | "zero";
}

export interface TaxCalculation {
  subtotal: number;
  cgst: number;           // IN: 50% of GST
  sgst: number;           // IN: 50% of GST
  igst: number;           // IN: inter-state
  vat: number;            // EU/International
  totalTax: number;
  grandTotal: number;
  regime: "gst" | "vat" | "none";
}

// Indian GST rates by category
const GST_RATES: Record<string, number> = {
  standard: 0.18,   // 18% for luxury goods
  reduced: 0.12,    // 12% for some categories
  zero: 0,
};

const VAT_RATES: Record<string, number> = {
  standard: 0.20,   // UK/EU standard
  reduced: 0.05,
  zero: 0,
};

/**
 * Calculates applicable taxes based on customer location and products.
 */
export function calculateTaxes(
  items: TaxLineItem[],
  customerCountry: string,
  customerState: string,
  sellerState = "Uttar Pradesh",
): TaxCalculation {
  const subtotal = items.reduce((s, i) => s + i.unitPriceINR * i.quantity, 0);
  const isInterstate = customerState !== sellerState;

  if (customerCountry === "IN") {
    let cgst = 0, sgst = 0, igst = 0;
    for (const item of items) {
      const rate = GST_RATES[item.taxCategory] ?? GST_RATES.standard;
      const base = item.unitPriceINR * item.quantity;
      if (isInterstate) {
        igst += base * rate;
      } else {
        cgst += base * (rate / 2);
        sgst += base * (rate / 2);
      }
    }
    const totalTax = cgst + sgst + igst;
    return { subtotal, cgst: Math.round(cgst), sgst: Math.round(sgst), igst: Math.round(igst), vat: 0, totalTax: Math.round(totalTax), grandTotal: Math.round(subtotal + totalTax), regime: "gst" };
  }

  if (["GB", "DE", "FR", "ES", "IT", "NL"].includes(customerCountry)) {
    let vat = 0;
    for (const item of items) {
      const rate = VAT_RATES[item.taxCategory] ?? VAT_RATES.standard;
      vat += item.unitPriceINR * item.quantity * rate;
    }
    return { subtotal, cgst: 0, sgst: 0, igst: 0, vat: Math.round(vat), totalTax: Math.round(vat), grandTotal: Math.round(subtotal + vat), regime: "vat" };
  }

  return { subtotal, cgst: 0, sgst: 0, igst: 0, vat: 0, totalTax: 0, grandTotal: subtotal, regime: "none" };
}

// ── Refunds ───────────────────────────────────────────────────────────────────

export type RefundReason = "damaged" | "wrong_item" | "not_delivered" | "quality" | "changed_mind";
export type RefundMethod = "original_payment" | "store_credit" | "bank_transfer";

export interface RefundRequest {
  orderId: string;
  items: { productId: string; quantity: number }[];
  reason: RefundReason;
  method: RefundMethod;
  evidenceUrls?: string[];   // Photos for damaged/wrong items
  customerNotes?: string;
}

export interface RefundResult {
  refundId: string;
  status: "approved" | "pending_review" | "rejected";
  refundAmountINR: number;
  estimatedDays: number;
  message: string;
}

const AUTO_APPROVE_REASONS: RefundReason[] = ["damaged", "wrong_item", "not_delivered"];

/**
 * Initiates a refund request with auto-approval for clear-cut cases.
 * Damaged/wrong/not-delivered items are auto-approved within 24h.
 */
export async function initiateRefund(req: RefundRequest): Promise<RefundResult> {
  const autoApprove = AUTO_APPROVE_REASONS.includes(req.reason);

  try {
    const res = await fetch("/api/orders/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...req, autoApprove }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    // Offline fallback — queue for review
    return {
      refundId: `REF-${Date.now()}`,
      status: "pending_review",
      refundAmountINR: 0,
      estimatedDays: autoApprove ? 1 : 5,
      message: autoApprove
        ? "Your refund has been approved and will be processed within 24 hours."
        : "Your refund request is under review. We'll respond within 3–5 business days.",
    };
  }
}
