"use client";

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;

/**
 * Google Analytics 4 component.
 * Only loads in production when GA4 ID is set.
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_title: document.title,
            send_page_view: true,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Track custom events in GA4.
 * Call from anywhere in the app.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
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

  newsletter: (email: string) =>
    trackEvent("newsletter_signup", { method: "footer_form" }),
};
