/**
 * Push Notification Manager (P6)
 *
 * Handles web push subscription, permission requests,
 * and pre-built notification triggers for loyalty and cart flows.
 */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

/**
 * Requests notification permission and subscribes to push.
 * Returns the subscription object to send to the backend.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[Push] Not supported in this browser");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("[Push] Permission denied");
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
      ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer
      : undefined,
  });

  // Send subscription to backend
  try {
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    console.log("[Push] Subscribed successfully");
  } catch {
    console.warn("[Push] Failed to register subscription on server");
  }

  return subscription;
}

/**
 * Registers the service worker on app startup.
 */
export async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("[SW] Registered:", registration.scope);
  } catch (err) {
    console.error("[SW] Registration failed:", err);
  }
}

// ── Pre-built Notification Payloads ──

export const NOTIFICATION_TEMPLATES = {
  abandonedCart: {
    title: "You left something beautiful behind 🕯️",
    body: "Your cart is waiting — complete your order before it's gone.",
    url: "/checkout",
    tag: "abandoned-cart",
  },
  loyaltyExpiry: {
    title: "Points expiring soon! ⏳",
    body: "You have points expiring in 7 days. Redeem them before they're gone.",
    url: "/rewards",
    tag: "loyalty-expiry",
  },
  flashSale: {
    title: "Flash Sale: 20% Off Everything ⚡",
    body: "For the next 24 hours only. Don't miss out.",
    url: "/collections",
    tag: "flash-sale",
  },
  tierUnlock: {
    title: "You've unlocked a new tier! 🎉",
    body: "Congratulations — enjoy your new rewards and benefits.",
    url: "/account/loyalty",
    tag: "tier-unlock",
  },
} as const;

// ── Utils ──

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}
