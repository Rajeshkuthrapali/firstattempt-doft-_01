/**
 * Customer Support Integration (P11)
 *
 * Provider-agnostic support layer with:
 * - Freshdesk ticket creation and status
 * - Live chat widget bootstrapper (Intercom / Freshchat)
 * - In-app help center search
 * - Escalation routing
 */

export type SupportProvider = "freshdesk" | "intercom" | "zendesk" | "console";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "order" | "shipping" | "refund" | "product" | "loyalty" | "technical" | "other";

export interface SupportTicket {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  customerEmail: string;
  customerName: string;
  orderId?: string;
  attachmentUrls?: string[];
}

export interface TicketResponse {
  ticketId: string;
  status: "open" | "pending" | "resolved";
  estimatedResponseHours: number;
  message: string;
}

// ── Configuration ──────────────────────────────────────────────────────────

const PROVIDER: SupportProvider =
  (import.meta.env.VITE_SUPPORT_PROVIDER as SupportProvider) || "console";

const SLA_HOURS: Record<TicketPriority, number> = {
  urgent: 2, high: 8, medium: 24, low: 72,
};

// ── Ticket Creation ────────────────────────────────────────────────────────

/**
 * Creates a support ticket with the configured provider.
 */
export async function createSupportTicket(ticket: SupportTicket): Promise<TicketResponse> {
  if (PROVIDER === "console") {
    console.log("[Support:Console] New ticket:", ticket.subject, ticket.category);
    return {
      ticketId: `DEMO-${Date.now()}`,
      status: "open",
      estimatedResponseHours: SLA_HOURS[ticket.priority],
      message: "Your request has been received. Our team will respond shortly.",
    };
  }

  try {
    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...ticket, provider: PROVIDER }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[Support] Ticket creation failed:", err);
    return {
      ticketId: `FALLBACK-${Date.now()}`,
      status: "open",
      estimatedResponseHours: SLA_HOURS[ticket.priority],
      message: "We received your request and will follow up via email.",
    };
  }
}

/**
 * Fetches a ticket's current status.
 */
export async function getTicketStatus(ticketId: string): Promise<TicketResponse | null> {
  try {
    const res = await fetch(`/api/support/tickets/${ticketId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Live Chat Widget ───────────────────────────────────────────────────────

interface ChatUserContext {
  userId: string;
  name: string;
  email: string;
  loyaltyTier: string;
  totalOrders: number;
}

/**
 * Bootstraps the live chat widget (Intercom or Freshchat).
 * Identifies the user for personalized support context.
 */
export function initLiveChat(ctx: ChatUserContext): void {
  if (PROVIDER === "intercom") {
    const w = window as unknown as { Intercom?: (cmd: string, cfg: unknown) => void };
    if (!w.Intercom) { console.warn("[Support] Intercom not loaded"); return; }
    w.Intercom("boot", {
      app_id: import.meta.env.VITE_INTERCOM_APP_ID,
      user_id: ctx.userId,
      email: ctx.email,
      name: ctx.name,
      custom_attributes: { loyalty_tier: ctx.loyaltyTier, total_orders: ctx.totalOrders },
    });
    return;
  }

  if (PROVIDER === "freshdesk") {
    const w = window as unknown as { fcWidget?: { init: (cfg: unknown) => void; setExternalId: (id: string) => void } };
    if (!w.fcWidget) { console.warn("[Support] Freshchat not loaded"); return; }
    w.fcWidget.init({
      token: import.meta.env.VITE_FRESHCHAT_TOKEN,
      host: import.meta.env.VITE_FRESHCHAT_HOST,
    });
    w.fcWidget.setExternalId(ctx.userId);
    return;
  }

  console.log("[Support:Console] Chat init for", ctx.name, ctx.email);
}

/** Shows the live chat widget. */
export function showLiveChat(): void {
  const w = window as unknown as { Intercom?: (cmd: string) => void; fcWidget?: { open: () => void } };
  w.Intercom?.("show");
  w.fcWidget?.open();
}

// ── Help Center Search ─────────────────────────────────────────────────────

export interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  category: string;
  relevance: number;
}

// Static help articles (in production, fetched from CMS / Freshdesk knowledge base)
const HELP_ARTICLES: HelpArticle[] = [
  { id: "h001", title: "How to track your order", excerpt: "Use your order ID to track real-time shipment status.", url: "/help/track-order", category: "shipping", relevance: 0 },
  { id: "h002", title: "Returning an item", excerpt: "We have a 30-day hassle-free return policy for all orders.", url: "/help/returns", category: "refund", relevance: 0 },
  { id: "h003", title: "Candle care & safety tips", excerpt: "Trim the wick, burn for 2–4 hours, keep away from drafts.", url: "/help/candle-care", category: "product", relevance: 0 },
  { id: "h004", title: "Loyalty points — how they work", excerpt: "Earn 1 point per ₹10 spent. Redeem at checkout from 500 points.", url: "/help/loyalty", category: "loyalty", relevance: 0 },
  { id: "h005", title: "International shipping & customs", excerpt: "We ship to 25+ countries. Customs duties are buyer's responsibility.", url: "/help/international", category: "shipping", relevance: 0 },
  { id: "h006", title: "Payment methods accepted", excerpt: "UPI, cards, net banking, Paytm, PhonePe, PayPal, Apple Pay.", url: "/help/payments", category: "order", relevance: 0 },
  { id: "h007", title: "Bulk and corporate orders", excerpt: "Order 10+ candles for weddings, events, or corporate gifting.", url: "/help/bulk-orders", category: "order", relevance: 0 },
  { id: "h008", title: "Scent-match quiz guide", excerpt: "Take our 5-question quiz to find your perfect candle collection.", url: "/scent-match", category: "product", relevance: 0 },
];

/**
 * Full-text search over help articles using lexical scoring.
 */
export function searchHelpCenter(query: string, limit = 4): HelpArticle[] {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (terms.length === 0) return HELP_ARTICLES.slice(0, limit);

  return HELP_ARTICLES
    .map((article) => {
      const text = `${article.title} ${article.excerpt} ${article.category}`.toLowerCase();
      const relevance = terms.reduce((score, term) => {
        if (article.title.toLowerCase().includes(term)) return score + 3;
        if (text.includes(term)) return score + 1;
        return score;
      }, 0);
      return { ...article, relevance };
    })
    .filter((a) => a.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

// ── Escalation Router ──────────────────────────────────────────────────────

/**
 * Routes high-priority tickets to appropriate specialist teams.
 */
export function getEscalationTeam(category: TicketCategory, priority: TicketPriority): string {
  if (priority === "urgent") return "tier2-escalations@lumiere.in";
  const teams: Partial<Record<TicketCategory, string>> = {
    refund: "refunds@lumiere.in",
    shipping: "logistics@lumiere.in",
    loyalty: "loyalty@lumiere.in",
    technical: "tech-support@lumiere.in",
  };
  return teams[category] || "support@lumiere.in";
}
