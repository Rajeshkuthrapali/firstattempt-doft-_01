import { useState, useEffect, useRef } from "react";

interface WSLogEntry {
  id: number;
  type: "error" | "latency" | "experiment" | "security" | "info";
  severity: "critical" | "warning" | "info";
  message: string;
  time: string;
  source: string;
}

const TYPE_STYLE: Record<WSLogEntry["type"], string> = {
  error: "bg-red-50 text-red-700",
  latency: "bg-amber-50 text-amber-700",
  experiment: "bg-indigo-50 text-indigo-700",
  security: "bg-rose-50 text-rose-700",
  info: "bg-blue-50 text-blue-700",
};

const SEVERITY_DOT: Record<WSLogEntry["severity"], string> = {
  critical: "bg-red-500",
  warning: "bg-amber-400",
  info: "bg-blue-400",
};

/**
 * Simulates incoming WebSocket log entries for the admin feed.
 * In production, this would connect to a real WebSocket endpoint.
 */
function useMockWSFeed(): WSLogEntry[] {
  const [logs, setLogs] = useState<WSLogEntry[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const MOCK_EVENTS: Omit<WSLogEntry, "id" | "time">[] = [
      { type: "error", severity: "critical", message: "Stripe webhook 402: card_declined for order #4821", source: "payment.ts:88" },
      { type: "experiment", severity: "info", message: "quiz-cta-position: Above Fold variant exposure count hit 1,500", source: "ab-testing" },
      { type: "latency", severity: "warning", message: "GraphQL cache miss on GetProducts — cold start 340ms", source: "graphql.ts" },
      { type: "info", severity: "info", message: "ML recommendations re-scored for session ctx#a8f2 (3 products)", source: "realtime.ts" },
      { type: "security", severity: "critical", message: "Rate limit exceeded from IP 203.0.113.42 (50 req/10s)", source: "edge-middleware" },
      { type: "experiment", severity: "info", message: "homepage-hero-variant: Video BG conversion rate passed 10%", source: "ab-testing" },
      { type: "latency", severity: "info", message: "Web Vitals LCP improved to 1.8s after service worker cache", source: "web-vitals" },
      { type: "error", severity: "warning", message: "Sanity CDN returned stale content (age: 3602s > max 3600s)", source: "sanity.ts" },
    ];

    const interval = setInterval(() => {
      const template = MOCK_EVENTS[counterRef.current % MOCK_EVENTS.length];
      counterRef.current += 1;
      const entry: WSLogEntry = {
        ...template,
        id: counterRef.current,
        time: new Date().toLocaleTimeString(),
      };
      setLogs((prev) => [entry, ...prev].slice(0, 50));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return logs;
}

/**
 * Real-time Admin Feed — WebSocket-connected live log stream
 * with auto-scrolling and severity indicators.
 */
export default function AdminFeed() {
  const logs = useMockWSFeed();
  const [paused, setPaused] = useState(false);
  const displayed = paused ? logs : logs;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926]">
            Live Feed
          </h1>
          <p className="text-xs text-[#9a8d82] mt-1">
            Real-time system events via WebSocket
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] text-green-600 uppercase tracking-wider font-semibold">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {paused ? "Paused" : "Live"}
          </span>
          <button
            onClick={() => setPaused(!paused)}
            className="px-3 py-1 text-[10px] uppercase tracking-widest border border-[#e8e0d8] rounded hover:border-[#c4a093] transition-colors text-[#6b5e54]"
          >
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>

      {/* ── Counters ── */}
      <div className="grid gap-4 grid-cols-4 mb-6">
        {(["error", "latency", "experiment", "security"] as const).map((type) => {
          const count = logs.filter((l) => l.type === type).length;
          return (
            <div key={type} className="rounded border border-[#e8e0d8] bg-white p-4">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">{type}</p>
              <p className="text-2xl font-medium text-[#2d2926] mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* ── Log Stream ── */}
      <div className="rounded-lg border border-[#e8e0d8] bg-white overflow-hidden max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f3ece4] text-[#9a8d82] text-[10px] uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-4 py-2.5 w-6" aria-label="Severity" />
              <th className="px-4 py-2.5 w-20">Time</th>
              <th className="px-4 py-2.5 w-24">Type</th>
              <th className="px-4 py-2.5">Event</th>
              <th className="px-4 py-2.5 w-32">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e0d8]">
            {displayed.map((log) => (
              <tr
                key={log.id}
                className={`transition-colors ${
                  log.severity === "critical" ? "bg-red-50/40" : "hover:bg-[#faf7f4]"
                }`}
              >
                <td className="px-4 py-2.5">
                  <span className={`inline-block h-2 w-2 rounded-full ${SEVERITY_DOT[log.severity]}`} title={log.severity} />
                </td>
                <td className="px-4 py-2.5 text-[11px] text-[#9a8d82] font-mono">{log.time}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${TYPE_STYLE[log.type]}`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[#2d2926] text-xs">{log.message}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-[#6b5e54]">{log.source}</td>
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-[#9a8d82]">
                  Waiting for events…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
