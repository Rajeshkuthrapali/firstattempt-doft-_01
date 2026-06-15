
/**
 * GA4 analytics utilities.
 * In production, integrate with a real analytics provider.
 * All functions are stubbed — they log to console in dev and are no-ops otherwise.
 */

const IS_DEV = import.meta.env.DEV;

const GA_ID = import.meta.env.VITE_GA4_ID;

/**
 * Initialize GA4 by inserting the gtag script.
 * Only loads in production when GA4_ID is set.
 */
export function initGA4() {
  if (!GA_ID || typeof window === "undefined") return;
  if (document.getElementById("ga4-script")) return;

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);

  const inline = document.createElement("script");
  inline.id = "ga4-init";
  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}', { send_page_view: true });
  `;
  document.head.appendChild(inline);
}

/**
 * Track custom events in GA4.
 * Call from anywhere in the app.
 */
export function trackEvent(
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>,
) {
  if (IS_DEV) {
    console.log(`[GA4] trackEvent: ${eventName}`, params);
  }
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      "event",
      eventName,
      params,
    );
  }
}

// Pre-defined e-commerce event helpers
export const analytics = {
  viewItem: (productId: string, name: string, price: number) =>
    trackEvent("view_item", {
      currency: "USD",
      value: price,
      items_id: productId,
      items_name: name,
    }),

  addToCart: (productId: string, name: string, price: number, qty: number) =>
    trackEvent("add_to_cart", {
      currency: "USD",
      value: price * qty,
      items_id: productId,
      items_name: name,
      quantity: qty,
    }),

  beginCheckout: (total: number) =>
    trackEvent("begin_checkout", {
      currency: "USD",
      value: total,
    }),

  purchase: (orderId: string, total: number) =>
    trackEvent("purchase", {
      transaction_id: orderId,
      currency: "USD",
      value: total,
    }),

  search: (query: string, resultCount: number) =>
    trackEvent("search", {
      search_term: query,
      results_count: resultCount,
    }),

  signUp: (method: string) => trackEvent("sign_up", { method }),

  newsletter: (_email: string) =>
    trackEvent("newsletter_signup", { method: "footer_form" }),
};

// ── Additional exports used by various components ──────────────────────

export function trackAddToCart(productId: string, name: string, price: number) {
  analytics.addToCart(productId, name, price, 1);
}

export function trackQuickView(productId: string, name: string) {
  trackEvent("quick_view", { items_id: productId, items_name: name });
}

export function trackAccountCreated(method: string) {
  analytics.signUp(method);
}

export function trackGiftOptionSelected(wrapping: string, hasMessage: boolean) {
  trackEvent("gift_option_selected", { wrapping, has_message: hasMessage });
}

export function trackBeginCheckout(
  items: Array<{ id: string; name: string; price: number; quantity: number }>,
  total: number,
) {
  trackEvent("begin_checkout", {
    currency: "USD",
    value: total,
    items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
  });
}

export function trackWishlistAdd(productId: string, name: string, price: number) {
  trackEvent("add_to_wishlist", { items_id: productId, items_name: name, value: price });
}

export function trackWishlistRemove(productId: string, name: string) {
  trackEvent("remove_from_wishlist", { items_id: productId, items_name: name });
}

export function trackSearchQuery(query: string, resultCount: number) {
  analytics.search(query, resultCount);
}
