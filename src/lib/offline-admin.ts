/**
 * Offline-First Admin & PWA Sync (P8)
 *
 * Extends the P7 background sync with:
 * - Loyalty data synchronization for offline dashboard
 * - Experiment data caching for offline analytics
 * - Admin IndexedDB store for offline-first dashboards
 */

// ── IndexedDB Abstraction ────────────────────────────────────────────────────

const DB_NAME = "lumiere_admin_offline";
const DB_VERSION = 1;

interface AdminStore {
  orders: unknown[];
  products: unknown[];
  loyaltyMetrics: unknown;
  experiments: unknown[];
  cohorts: unknown[];
  lastFetched: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("admin_cache")) {
        db.createObjectStore("admin_cache", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores admin data in IndexedDB for offline access.
 */
export async function cacheAdminData(key: keyof AdminStore, data: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("admin_cache", "readwrite");
    const store = tx.objectStore("admin_cache");
    store.put({ key, data, cachedAt: new Date().toISOString() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn("[OfflineAdmin] Cache write failed:", err);
  }
}

/**
 * Retrieves cached admin data from IndexedDB.
 */
export async function getCachedAdminData<T>(key: keyof AdminStore): Promise<{ data: T; cachedAt: string } | null> {
  try {
    const db = await openDB();
    const tx = db.transaction("admin_cache", "readonly");
    const store = tx.objectStore("admin_cache");
    const request = store.get(key);
    return new Promise((resolve) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result ? { data: request.result.data, cachedAt: request.result.cachedAt } : null);
      };
      request.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

// ── Data Sync Orchestrator ───────────────────────────────────────────────────

interface SyncConfig {
  endpoint: string;
  storeKey: keyof AdminStore;
  intervalMs: number;
}

const SYNC_CONFIGS: SyncConfig[] = [
  { endpoint: "/api/admin/orders", storeKey: "orders", intervalMs: 60_000 },
  { endpoint: "/api/admin/products", storeKey: "products", intervalMs: 120_000 },
  { endpoint: "/api/admin/loyalty/metrics", storeKey: "loyaltyMetrics", intervalMs: 90_000 },
  { endpoint: "/api/admin/experiments", storeKey: "experiments", intervalMs: 180_000 },
  { endpoint: "/api/admin/cohorts", storeKey: "cohorts", intervalMs: 300_000 },
];

/**
 * Fetches fresh data from the API and caches it in IndexedDB.
 * Falls back to cached data if offline.
 */
export async function syncAdminStore(config: SyncConfig): Promise<unknown> {
  try {
    const res = await fetch(config.endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    await cacheAdminData(config.storeKey, data);
    return data;
  } catch {
    // Offline fallback
    const cached = await getCachedAdminData(config.storeKey);
    if (cached) {
      console.log(`[OfflineAdmin] Using cached ${config.storeKey} from ${cached.cachedAt}`);
      return cached.data;
    }
    return null;
  }
}

/**
 * Starts periodic background sync for all admin data stores.
 * Returns a cleanup function to stop all syncs.
 */
export function startAdminSync(): () => void {
  const intervals: ReturnType<typeof setInterval>[] = [];

  for (const config of SYNC_CONFIGS) {
    // Initial sync
    syncAdminStore(config);
    // Periodic sync
    intervals.push(setInterval(() => syncAdminStore(config), config.intervalMs));
  }

  console.log("[OfflineAdmin] Background sync started for", SYNC_CONFIGS.length, "stores");

  return () => {
    intervals.forEach(clearInterval);
    console.log("[OfflineAdmin] Background sync stopped");
  };
}

// ── Connectivity Monitor ─────────────────────────────────────────────────────

type ConnectivityHandler = (online: boolean) => void;

/**
 * Monitors network connectivity changes.
 * Triggers a full sync when coming back online.
 */
export function watchConnectivity(onStatusChange?: ConnectivityHandler): () => void {
  const handleOnline = () => {
    console.log("[OfflineAdmin] Back online — triggering full sync");
    onStatusChange?.(true);
    SYNC_CONFIGS.forEach(syncAdminStore);
  };

  const handleOffline = () => {
    console.log("[OfflineAdmin] Went offline — using cached data");
    onStatusChange?.(false);
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
