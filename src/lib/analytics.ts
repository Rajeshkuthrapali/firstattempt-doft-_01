/**
 * GA4 Analytics — lightweight wrapper around Google Analytics 4.
 * Sends custom events for checkout and payment flows.
 *
 * Setup: Add GA4 measurement ID to `.env` as `VITE_GA4_MEASUREMENT_ID`.
 * The gtag snippet is loaded in `index.html`.
 */

/** Type-safe gtag interface */
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;

/**
 * Initialises the GA4 gtag script. Called once in `main.tsx`.
 * No-ops if `VITE_GA4_MEASUREMENT_ID` is not set.
 */
export function initGA4(): void {
  if (!GA4_ID || typeof window === "undefined") return;

  // Inject gtag script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID, {
    send_page_view: true,
  });
}

/** Send a GA4 page_view event (for SPA route changes). */
export function trackPageView(path: string, title: string): void {
  if (!GA4_ID) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
  });
}

/** Checkout flow: begin_checkout event */
export function trackBeginCheckout(items: CheckoutItem[], value: number): void {
  if (!GA4_ID) return;
  window.gtag("event", "begin_checkout", {
    currency: "INR",
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

/** Payment success event */
export function trackPurchase(
  transactionId: string,
  items: CheckoutItem[],
  value: number,
): void {
  if (!GA4_ID) return;
  window.gtag("event", "purchase", {
    transaction_id: transactionId,
    currency: "INR",
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

/** Payment failure event */
export function trackPaymentError(
  errorCode: string,
  errorMessage: string,
): void {
  if (!GA4_ID) return;
  window.gtag("event", "payment_error", {
    error_code: errorCode,
    error_message: errorMessage,
  });
}

/** Add to cart event */
export function trackAddToCart(
  itemId: string,
  itemName: string,
  price: number,
): void {
  if (!GA4_ID) return;
  window.gtag("event", "add_to_cart", {
    currency: "INR",
    value: price,
    items: [{ item_id: itemId, item_name: itemName, price, quantity: 1 }],
  });
}

/** Remove from cart event */
export function trackRemoveFromCart(
  itemId: string,
  itemName: string,
  price: number,
): void {
  if (!GA4_ID) return;
  window.gtag("event", "remove_from_cart", {
    currency: "INR",
    value: price,
    items: [{ item_id: itemId, item_name: itemName, price, quantity: 1 }],
  });
}

/** View item (PDP) event */
export function trackViewItem(
  itemId: string,
  itemName: string,
  price: number,
  category: string,
): void {
  if (!GA4_ID) return;
  window.gtag("event", "view_item", {
    currency: "INR",
    value: price,
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        price,
        item_category: category,
      },
    ],
  });
}

/** View cart event */
export function trackViewCart(items: CheckoutItem[], value: number): void {
  if (!GA4_ID) return;
  window.gtag("event", "view_cart", {
    currency: "INR",
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

/** Generic checkout item type for GA4 events */
export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// ── P1 Analytics Events ───────────────────────────────────────────────────────

/**
 * Generic GA4 event helper — use for any event not covered by a typed wrapper.
 * @param name - GA4 event name
 * @param params - Event parameters
 */
export function trackEvent(
  name: string,
  params: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

/** User added a product to their wishlist. */
export function trackWishlistAdd(
  itemId: string,
  itemName: string,
  price: number,
): void {
  trackEvent("add_to_wishlist", {
    currency: "INR",
    value: price,
    items: [{ item_id: itemId, item_name: itemName, price }],
  });
}

/** User removed a product from their wishlist. */
export function trackWishlistRemove(itemId: string, itemName: string): void {
  trackEvent("remove_from_wishlist", { item_id: itemId, item_name: itemName });
}

/** New account successfully created. */
export function trackAccountCreated(
  method: "email" | "google" | "facebook",
): void {
  trackEvent("account_created", { method });
}

/** User typed a search query (fire on debounce / submit). */
export function trackSearchQuery(query: string, resultCount: number): void {
  trackEvent("search", { search_term: query, result_count: resultCount });
}

/** Abandoned-cart recovery banner clicked (user returned to cart). */
export function trackAbandonedCartRecovery(): void {
  trackEvent("abandoned_cart_recovery", { source: "banner" });
}

/** Gift wrapping option selected during checkout. */
export function trackGiftOptionSelected(
  wrapping: "standard" | "premium" | "none",
  hasMessage: boolean,
): void {
  trackEvent("gift_option_selected", {
    wrapping_type: wrapping,
    has_message: hasMessage,
  });
}

/** User opened a quick-view modal for a product. */
export function trackQuickView(itemId: string, itemName: string): void {
  trackEvent("quick_view", { item_id: itemId, item_name: itemName });
}

