import { useState, useMemo } from "react";

type LogType = "all" | "error" | "latency" | "db" | "info" | "security";

interface LogEntry {
  id: number;
  type: Exclude<LogType, "all">;
  severity: "critical" | "warning" | "info";
  message: string;
  time: string;
  trace: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: 1, type: "error", severity: "critical", message: "Stripe webhook signature mismatch — payload rejected", time: "10:41 AM", trace: "payment.ts:42" },
  { id: 2, type: "latency", severity: "warning", message: "p95 checkout API latency > 800ms (spike: 1220ms)", time: "09:12 AM", trace: "POST /api/checkout" },
  { id: 3, type: "security", severity: "critical", message: "Failed admin login attempt from 185.220.x.x", time: "08:55 AM", trace: "auth-middleware" },
  { id: 4, type: "info", severity: "info", message: "Sanity webhook: cache invalidated for /collections", time: "08:30 AM", trace: "sanity-trigger" },
  { id: 5, type: "db", severity: "warning", message: "Slow query scan on Product table (142ms, threshold 100ms)", time: "08:15 AM", trace: "Prisma → getProducts" },
  { id: 6, type: "error", severity: "warning", message: "Instagram API rate limit approached (80% quota used)", time: "Yesterday", trace: "social-feed.ts:71" },
  { id: 7, type: "latency", severity: "info", message: "Web Vitals: LCP degraded to 2.8s on /collections (target <2.5s)", time: "Yesterday", trace: "web-vitals/LCP" },
  { id: 8, type: "db", severity: "info", message: "Order index rebuild completed (6 new indices applied)", time: "Yesterday", trace: "prisma db push" },
];

const TYPE_STYLE: Record<Exclude<LogType, "all">, string> = {
  error: "bg-red-50 text-red-700",
  latency: "bg-amber-50 text-amber-700",
  db: "bg-purple-50 text-purple-700",
  info: "bg-blue-50 text-blue-700",
  security: "bg-rose-50 text-rose-700",
};

const SEVERITY_DOT: Record<LogEntry["severity"], string> = {
  critical: "bg-red-500",
  warning: "bg-amber-400",
  info: "bg-blue-400",
};

/**
 * Admin System Logs — real-time anomaly dashboard with filtering,
 * severity indicators, and summary metric cards.
 */
export default function AdminLogs() {
  const [filter, setFilter] = useState<LogType>("all");

  const filtered = useMemo(
    () => (filter === "all" ? MOCK_LOGS : MOCK_LOGS.filter((l) => l.type === filter)),
    [filter],
  );

  const criticalCount = MOCK_LOGS.filter((l) => l.severity === "critical").length;
  const warningCount = MOCK_LOGS.filter((l) => l.severity === "warning").length;

  const filters: { value: LogType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "error", label: "Errors" },
    { value: "latency", label: "Latency" },
    { value: "db", label: "Database" },
    { value: "security", label: "Security" },
    { value: "info", label: "Info" },
  ];

  return (
    <div>
      <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926] mb-8">
        System Logs &amp; Metrics
      </h1>

      {/* ── Summary Cards ── */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="rounded border border-[#e8e0d8] bg-white p-5">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">Error Rate (24h)</p>
          <p className="mt-2 text-3xl font-medium text-red-600">0.02%</p>
          <p className="text-[10px] text-[#9a8d82] mt-1">Target: &lt; 0.05%</p>
        </div>
        <div className="rounded border border-[#e8e0d8] bg-white p-5">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">Lighthouse CI</p>
          <p className="mt-2 text-3xl font-medium text-green-600">96</p>
          <p className="text-[10px] text-[#9a8d82] mt-1">Threshold ≥ 90</p>
        </div>
        <div className="rounded border border-[#e8e0d8] bg-white p-5">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">DB Query p95</p>
          <p className="mt-2 text-3xl font-medium text-amber-600">142ms</p>
          <p className="text-[10px] text-[#9a8d82] mt-1">Threshold: 100ms</p>
        </div>
        <div className="rounded border border-[#e8e0d8] bg-white p-5">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">Active Anomalies</p>
          <p className="mt-2 text-3xl font-medium text-[#2d2926]">
            <span className="text-red-600">{criticalCount}</span>
            <span className="text-[10px] text-[#9a8d82] ml-1 font-normal">critical</span>
            <span className="mx-2 text-[#e8e0d8]">·</span>
            <span className="text-amber-600">{warningCount}</span>
            <span className="text-[10px] text-[#9a8d82] ml-1 font-normal">warnings</span>
          </p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <nav className="flex flex-wrap gap-2 mb-6" aria-label="Log type filter">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-full border transition-colors ${
              filter === value
                ? "bg-[#2d2926] text-white border-[#2d2926]"
                : "border-[#e8e0d8] text-[#6b5e54] hover:border-[#c4a093]"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ── Log Table ── */}
      <div className="rounded-lg border border-[#e8e0d8] bg-white overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f3ece4] text-[#9a8d82] text-[10px] uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 w-8" aria-label="Severity" />
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Message</th>
              <th className="px-5 py-3">Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e0d8]">
            {filtered.map((log) => (
              <tr
                key={log.id}
                className={`hover:bg-[#faf7f4] ${log.severity === "critical" ? "bg-red-50/30" : ""}`}
              >
                <td className="px-5 py-3">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${SEVERITY_DOT[log.severity]}`}
                    title={log.severity}
                  />
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-[#9a8d82] text-xs">{log.time}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${TYPE_STYLE[log.type]}`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-5 py-3 font-medium text-[#2d2926]">{log.message}</td>
                <td className="px-5 py-3 font-mono text-xs text-[#6b5e54]">{log.trace}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[#9a8d82] text-sm">
                  No logs match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-[#9a8d82]">
        * Log data is simulated. In production, this view subscribes to a WebSocket or SSE endpoint for real-time entries.
      </p>
    </div>
  );
}
