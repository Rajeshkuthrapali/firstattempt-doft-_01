/**
 * PWA Engagement (P9)
 *
 * Personalized push notifications with dynamic offers,
 * and offline-first checkout with queued transactions.
 */

import { type CurrencyCode, formatCurrencyAmount } from "./global-commerce";

// ── Personalized Push ────────────────────────────────────────────────────────

export interface PersonalizedPushPayload {
  userId: string;
  title: string;
  body: string;
  url: string;
  tag: string;
  icon?: string;
  data?: Record<string, unknown>;
}

interface UserContext {
  name: string;
  loyaltyTier: string;
  loyaltyPoints: number;
  scentProfile: string | null;
  cartValue: number;
  currency: CurrencyCode;
  lastPurchaseDaysAgo: number;
}

/**
 * Generates personalized push notification payloads
 * based on user context and trigger type.
 */
export function generatePersonalizedPush(
  ctx: UserContext,
  trigger: "abandoned_cart" | "loyalty_expiry" | "flash_sale" | "restock" | "tier_upgrade" | "price_drop",
): PersonalizedPushPayload {
  const userId = "user";

  switch (trigger) {
    case "abandoned_cart":
      return {
        userId,
        title: `${ctx.name}, your cart misses you 🕯️`,
        body: `${formatCurrencyAmount(ctx.cartValue, ctx.currency)} of handcrafted candles await. Complete your order now!`,
        url: "/checkout",
        tag: "abandoned-cart",
      };

    case "loyalty_expiry":
      return {
        userId,
        title: "Points expiring soon! ⏳",
        body: `You have ${ctx.loyaltyPoints.toLocaleString()} points expiring in 7 days. Redeem them at /rewards.`,
        url: "/rewards",
        tag: "loyalty-expiry",
      };

    case "flash_sale":
      return {
        userId,
        title: ctx.scentProfile
          ? `Flash Sale: ${ctx.scentProfile} candles 25% off ⚡`
          : "Flash Sale: 25% Off Everything ⚡",
        body: "For the next 12 hours only. Your favorites are waiting.",
        url: ctx.scentProfile ? `/collections?scent=${ctx.scentProfile.toLowerCase()}` : "/collections",
        tag: "flash-sale",
      };

    case "restock":
      return {
        userId,
        title: "Back in stock! 🎉",
        body: ctx.scentProfile
          ? `Your favorite ${ctx.scentProfile} candles are back. Grab them before they're gone.`
          : "Popular items are back in stock!",
        url: "/collections",
        tag: "restock",
      };

    case "tier_upgrade":
      return {
        userId,
        title: `You're now ${ctx.loyaltyTier}! 🏆`,
        body: `Congratulations ${ctx.name}! Enjoy your new ${ctx.loyaltyTier} tier benefits including exclusive discounts.`,
        url: "/account/loyalty",
        tag: "tier-upgrade",
      };

    case "price_drop":
      return {
        userId,
        title: "Price drop on your wishlist 💰",
        body: "Items you've been watching just went on sale!",
        url: "/account",
        tag: "price-drop",
      };
  }
}

// ── Offline-First Checkout ───────────────────────────────────────────────────

export interface QueuedTransaction {
  id: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  currency: CurrencyCode;
  shippingAddress: Record<string, string>;
  paymentMethod: string;
  loyaltyPointsUsed: number;
  createdAt: string;
  status: "queued" | "processing" | "completed" | "failed";
  retryCount: number;
}

const TX_QUEUE_KEY = "lumiere_offline_checkout";

/** Queues a checkout transaction for processing when online. */
export function queueTransaction(tx: Omit<QueuedTransaction, "id" | "createdAt" | "status" | "retryCount">): string {
  const queue = getTransactionQueue();
  const id = `tx-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;
  const entry: QueuedTransaction = {
    ...tx,
    id,
    createdAt: new Date().toISOString(),
    status: "queued",
    retryCount: 0,
  };
  queue.push(entry);
  localStorage.setItem(TX_QUEUE_KEY, JSON.stringify(queue));
  console.log(`[OfflineCheckout] Transaction ${id} queued`);

  // Attempt immediate processing if online
  if (navigator.onLine) {
    processTransactionQueue();
  }

  return id;
}

/** Retrieves all queued transactions. */
export function getTransactionQueue(): QueuedTransaction[] {
  try {
    return JSON.parse(localStorage.getItem(TX_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Processes all queued transactions sequentially. */
export async function processTransactionQueue(): Promise<void> {
  const queue = getTransactionQueue();
  const pending = queue.filter((tx) => tx.status === "queued" || (tx.status === "failed" && tx.retryCount < 3));

  if (pending.length === 0) return;

  console.log(`[OfflineCheckout] Processing ${pending.length} queued transactions`);

  for (const tx of pending) {
    tx.status = "processing";
    try {
      const res = await fetch("/api/checkout/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });
      tx.status = res.ok ? "completed" : "failed";
      if (!res.ok) tx.retryCount += 1;
    } catch {
      tx.status = "failed";
      tx.retryCount += 1;
    }
  }

  // Persist updated statuses
  localStorage.setItem(TX_QUEUE_KEY, JSON.stringify(queue));

  const completed = pending.filter((tx) => tx.status === "completed").length;
  console.log(`[OfflineCheckout] ${completed}/${pending.length} transactions completed`);
}

/** Registers online/offline event listeners for auto-processing. */
export function initOfflineCheckout(): () => void {
  const handleOnline = () => {
    console.log("[OfflineCheckout] Back online — processing queue");
    processTransactionQueue();
  };

  window.addEventListener("online", handleOnline);
  return () => window.removeEventListener("online", handleOnline);
}

/** Returns a summary of the transaction queue status. */
export function getQueueSummary(): {
  total: number;
  queued: number;
  completed: number;
  failed: number;
} {
  const queue = getTransactionQueue();
  return {
    total: queue.length,
    queued: queue.filter((t) => t.status === "queued").length,
    completed: queue.filter((t) => t.status === "completed").length,
    failed: queue.filter((t) => t.status === "failed").length,
  };
}
