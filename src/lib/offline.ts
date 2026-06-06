/**
 * Background Sync Manager (P7)
 *
 * Enables offline cart and wishlist operations that sync
 * when connectivity is restored. Uses the Background Sync API
 * with IndexedDB fallback for pending operations.
 */

interface SyncOperation {
  id: string;
  type: "cart_add" | "cart_remove" | "wishlist_add" | "wishlist_remove";
  payload: Record<string, unknown>;
  timestamp: number;
  status: "pending" | "synced" | "failed";
}

const SYNC_STORE_KEY = "lumiere_sync_queue";

/** Queues an operation for background sync. */
export function queueSyncOperation(
  type: SyncOperation["type"],
  payload: Record<string, unknown>,
): void {
  const queue = getSyncQueue();
  queue.push({
    id: crypto.randomUUID(),
    type,
    payload,
    timestamp: Date.now(),
    status: "pending",
  });
  localStorage.setItem(SYNC_STORE_KEY, JSON.stringify(queue));

  // Request background sync if available
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((reg) => {
      (reg as unknown as { sync: { register: (tag: string) => Promise<void> } })
        .sync.register("lumiere-sync");
    });
  } else {
    // Fallback: try immediate sync
    processSyncQueue();
  }
}

/** Gets all pending sync operations. */
export function getSyncQueue(): SyncOperation[] {
  try {
    return JSON.parse(localStorage.getItem(SYNC_STORE_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Processes all pending operations in the queue. */
export async function processSyncQueue(): Promise<void> {
  const queue = getSyncQueue();
  const pending = queue.filter((op) => op.status === "pending");

  if (pending.length === 0) return;

  console.log(`[Sync] Processing ${pending.length} pending operations`);

  for (const op of pending) {
    try {
      const endpoint = getEndpoint(op.type);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op.payload),
      });
      op.status = res.ok ? "synced" : "failed";
    } catch {
      op.status = "failed";
    }
  }

  // Keep failed ops for retry, remove synced ones
  const remaining = queue.filter((op) => op.status !== "synced");
  localStorage.setItem(SYNC_STORE_KEY, JSON.stringify(remaining));

  const synced = pending.filter((op) => op.status === "synced").length;
  console.log(`[Sync] Completed: ${synced}/${pending.length} synced`);
}

/** Clears all sync operations. */
export function clearSyncQueue(): void {
  localStorage.removeItem(SYNC_STORE_KEY);
}

function getEndpoint(type: SyncOperation["type"]): string {
  switch (type) {
    case "cart_add":
    case "cart_remove":
      return "/api/cart/sync";
    case "wishlist_add":
    case "wishlist_remove":
      return "/api/wishlist/sync";
  }
}

// ── Install Prompt Manager ───────────────────────────────────────────────────

let deferredPrompt: Event | null = null;

/** Listens for the browser's install prompt and defers it for manual trigger. */
export function initInstallPrompt(): void {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("[PWA] Install prompt deferred for manual trigger");
  });
}

/** Shows the deferred install prompt. Returns true if the user accepted. */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) return false;

  const prompt = deferredPrompt as BeforeInstallPromptEvent;
  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  deferredPrompt = null;

  console.log("[PWA] Install outcome:", outcome);
  return outcome === "accepted";
}

/** Returns whether an install prompt is available. */
export function isInstallAvailable(): boolean {
  return deferredPrompt !== null;
}

/** Returns whether the app is running in standalone/PWA mode. */
export function isRunningAsPWA(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Type augmentation for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
