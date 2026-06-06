/**
 * Marketing Automation Connectors (P7)
 *
 * Provider-agnostic integration layer for:
 * - Klaviyo (email + SMS marketing)
 * - HubSpot (CRM + marketing automation)
 * - Third-party loyalty partners
 *
 * Events flow: User Action → Connector → Provider API
 */

export type MarketingProvider = "klaviyo" | "hubspot" | "console";

interface MarketingEvent {
  event: string;
  email: string;
  properties: Record<string, unknown>;
}

interface LoyaltyPartnerSync {
  partnerId: string;
  userId: string;
  points: number;
  tier: string;
  action: "earn" | "redeem" | "sync";
}

const provider: MarketingProvider =
  (import.meta.env.VITE_MARKETING_PROVIDER as MarketingProvider) || "console";

// ── Klaviyo Connector ────────────────────────────────────────────────────────

const KLAVIYO_API_KEY = import.meta.env.VITE_KLAVIYO_API_KEY as string | undefined;

async function sendToKlaviyo(event: MarketingEvent): Promise<boolean> {
  if (!KLAVIYO_API_KEY) {
    console.warn("[Klaviyo] No API key configured");
    return false;
  }

  try {
    const res = await fetch("https://a.]klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        revision: "2024-02-15",
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            metric: { data: { type: "metric", attributes: { name: event.event } } },
            profile: { data: { type: "profile", attributes: { email: event.email } } },
            properties: event.properties,
            time: new Date().toISOString(),
          },
        },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[Klaviyo] Event failed:", err);
    return false;
  }
}

// ── HubSpot Connector ────────────────────────────────────────────────────────

const HUBSPOT_API_KEY = import.meta.env.VITE_HUBSPOT_API_KEY as string | undefined;

async function sendToHubSpot(event: MarketingEvent): Promise<boolean> {
  if (!HUBSPOT_API_KEY) {
    console.warn("[HubSpot] No API key configured");
    return false;
  }

  try {
    const res = await fetch(
      `https://api.hubapi.com/events/v3/send?hapikey=${HUBSPOT_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: `pe_lumiere_${event.event}`,
          email: event.email,
          properties: event.properties,
          occurredAt: new Date().toISOString(),
        }),
      },
    );
    return res.ok;
  } catch (err) {
    console.error("[HubSpot] Event failed:", err);
    return false;
  }
}

// ── Unified Event Dispatcher ─────────────────────────────────────────────────

/**
 * Dispatches a marketing event to the configured provider.
 * Falls back to console logging in development.
 */
export async function trackMarketingEvent(event: MarketingEvent): Promise<boolean> {
  switch (provider) {
    case "klaviyo":
      return sendToKlaviyo(event);
    case "hubspot":
      return sendToHubSpot(event);
    default:
      console.log("[Marketing:Console]", event.event, event.email, event.properties);
      return true;
  }
}

// ── Pre-built Event Builders ─────────────────────────────────────────────────

/** Tracks a completed purchase for marketing automation. */
export function trackPurchase(email: string, orderId: string, total: number, items: string[]): void {
  trackMarketingEvent({
    event: "order_completed",
    email,
    properties: { order_id: orderId, total, currency: "INR", item_count: items.length, items },
  });
}

/** Tracks quiz completion for personalized follow-up campaigns. */
export function trackQuizCompletion(email: string, scentProfile: string): void {
  trackMarketingEvent({
    event: "quiz_completed",
    email,
    properties: { scent_profile: scentProfile },
  });
}

/** Tracks loyalty tier change for tier-specific campaigns. */
export function trackTierChange(email: string, newTier: string, points: number): void {
  trackMarketingEvent({
    event: "tier_changed",
    email,
    properties: { new_tier: newTier, total_points: points },
  });
}

/** Tracks abandoned cart for recovery campaigns. */
export function trackCartAbandonment(email: string, items: string[], cartValue: number): void {
  trackMarketingEvent({
    event: "cart_abandoned",
    email,
    properties: { items, cart_value: cartValue, currency: "INR" },
  });
}

// ── Loyalty Partner Integration ──────────────────────────────────────────────

const LOYALTY_PARTNERS: Record<string, { apiUrl: string; apiKey: string }> = {};

/** Registers a third-party loyalty partner. */
export function registerLoyaltyPartner(partnerId: string, apiUrl: string, apiKey: string): void {
  LOYALTY_PARTNERS[partnerId] = { apiUrl, apiKey };
  console.log(`[Loyalty] Registered partner: ${partnerId}`);
}

/** Syncs loyalty data with a third-party partner. */
export async function syncWithLoyaltyPartner(sync: LoyaltyPartnerSync): Promise<boolean> {
  const partner = LOYALTY_PARTNERS[sync.partnerId];
  if (!partner) {
    console.warn(`[Loyalty] Unknown partner: ${sync.partnerId}`);
    return false;
  }

  try {
    const res = await fetch(`${partner.apiUrl}/points/${sync.action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${partner.apiKey}`,
      },
      body: JSON.stringify({
        external_user_id: sync.userId,
        points: sync.points,
        tier: sync.tier,
        source: "lumiere",
      }),
    });
    return res.ok;
  } catch (err) {
    console.error(`[Loyalty] Sync with ${sync.partnerId} failed:`, err);
    return false;
  }
}
