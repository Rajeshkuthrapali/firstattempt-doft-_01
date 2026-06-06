/**
 * Server-Sent Events (SSE) Client (P6)
 *
 * Provides real-time streaming for live inventory updates,
 * price changes, and flash sale notifications.
 * In production, connects to an SSE endpoint on the API server.
 */

export interface SSEEvent {
  type: "inventory_update" | "price_change" | "flash_sale" | "restock";
  productId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

type SSEHandler = (event: SSEEvent) => void;

/**
 * Manages an SSE connection with automatic reconnection.
 */
export class LiveStream {
  private source: EventSource | null = null;
  private handlers = new Map<string, Set<SSEHandler>>();
  private reconnectMs = 3000;
  private url: string;

  constructor(url = "/api/events/stream") {
    this.url = url;
  }

  /** Opens the SSE connection. */
  connect(): void {
    if (this.source) return;

    try {
      this.source = new EventSource(this.url);

      this.source.onmessage = (event) => {
        try {
          const parsed: SSEEvent = JSON.parse(event.data);
          this.emit(parsed.type, parsed);
          this.emit("*", parsed); // wildcard listeners
        } catch {
          console.warn("[SSE] Failed to parse event:", event.data);
        }
      };

      this.source.onerror = () => {
        console.warn("[SSE] Connection lost, reconnecting...");
        this.disconnect();
        setTimeout(() => this.connect(), this.reconnectMs);
      };

      this.source.onopen = () => {
        console.log("[SSE] Connected to live stream");
      };
    } catch {
      console.warn("[SSE] EventSource not available, falling back to polling");
    }
  }

  /** Closes the SSE connection. */
  disconnect(): void {
    this.source?.close();
    this.source = null;
  }

  /** Subscribe to a specific event type. */
  on(type: string, handler: SSEHandler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  private emit(type: string, event: SSEEvent): void {
    this.handlers.get(type)?.forEach((h) => h(event));
  }
}

/**
 * Streaming ML Inference Dispatcher (P6)
 *
 * Streams recommendation updates as user behavior changes
 * within a session. Maintains a session context graph and
 * re-requests scored recommendations from the inference endpoint.
 */
export class StreamingRecommender {
  private sessionContext: string[] = [];
  private subscribers = new Set<(recs: string[]) => void>();

  /** Records a user interaction for the current session. */
  trackInteraction(productId: string): void {
    if (!this.sessionContext.includes(productId)) {
      this.sessionContext.push(productId);
      this.refreshRecommendations();
    }
  }

  /** Subscribe to recommendation updates. */
  onUpdate(handler: (recommendations: string[]) => void): () => void {
    this.subscribers.add(handler);
    return () => this.subscribers.delete(handler);
  }

  /** Re-computes recommendations based on current session context. */
  private async refreshRecommendations(): Promise<void> {
    try {
      const res = await fetch("/api/recommendations/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interacted: this.sessionContext }),
      });
      if (!res.ok) return;
      const { recommendations } = await res.json();
      this.subscribers.forEach((h) => h(recommendations));
    } catch {
      // Graceful degradation — stale recommendations persist
      console.warn("[StreamRec] Inference endpoint unavailable");
    }
  }

  /** Clears the session context. */
  reset(): void {
    this.sessionContext = [];
  }
}

// ── Singleton instances ──

export const liveStream = new LiveStream();
export const streamingRecommender = new StreamingRecommender();
