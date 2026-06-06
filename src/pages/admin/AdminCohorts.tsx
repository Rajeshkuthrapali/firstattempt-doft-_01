import { useState } from "react";

interface CohortRow {
  cohort: string;
  size: number;
  retention: number[];
}

interface RevenueProjection {
  month: string;
  actual: number | null;
  forecast: number;
}

const COHORTS: CohortRow[] = [
  { cohort: "2025-10", size: 420, retention: [100, 62, 48, 38, 31, 27] },
  { cohort: "2025-11", size: 510, retention: [100, 58, 44, 35, 28] },
  { cohort: "2025-12", size: 680, retention: [100, 65, 52, 41] },
  { cohort: "2026-01", size: 550, retention: [100, 60, 46] },
  { cohort: "2026-02", size: 490, retention: [100, 57] },
  { cohort: "2026-03", size: 620, retention: [100] },
];

const REVENUE: RevenueProjection[] = [
  { month: "Oct '25", actual: 285000, forecast: 280000 },
  { month: "Nov '25", actual: 342000, forecast: 330000 },
  { month: "Dec '25", actual: 498000, forecast: 470000 },
  { month: "Jan '26", actual: 380000, forecast: 390000 },
  { month: "Feb '26", actual: 412000, forecast: 420000 },
  { month: "Mar '26", actual: 455000, forecast: 460000 },
  { month: "Apr '26", actual: null, forecast: 510000 },
  { month: "May '26", actual: null, forecast: 560000 },
  { month: "Jun '26", actual: null, forecast: 620000 },
];

function cellColor(pct: number): string {
  if (pct >= 60) return "bg-green-100 text-green-800";
  if (pct >= 40) return "bg-emerald-50 text-emerald-700";
  if (pct >= 25) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-600";
}

/**
 * Admin Cohort & Forecasting Dashboard — monthly cohort retention
 * heatmap and predictive revenue chart with actual vs forecast.
 */
export default function AdminCohorts() {
  const [view, setView] = useState<"retention" | "forecast">("retention");
  const maxRevenue = Math.max(...REVENUE.map((r) => r.forecast));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926]">
            Cohorts & Forecasting
          </h1>
          <p className="text-xs text-[#9a8d82] mt-1">
            Retention analysis and predictive revenue modeling
          </p>
        </div>
        <div className="flex gap-1 rounded border border-[#e8e0d8] p-0.5">
          {(["retention", "forecast"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest rounded transition-colors ${
                view === tab ? "bg-[#2d2926] text-white" : "text-[#6b5e54] hover:bg-[#f3ece4]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {view === "retention" && (
        <>
          {/* ── Summary ── */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="rounded border border-[#e8e0d8] bg-white p-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">Avg M1 Retention</p>
              <p className="mt-2 text-2xl font-medium text-[#2d2926]">
                {Math.round(COHORTS.reduce((s, c) => s + (c.retention[1] || 0), 0) / COHORTS.filter((c) => c.retention.length > 1).length)}%
              </p>
            </div>
            <div className="rounded border border-[#e8e0d8] bg-white p-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">Total Acquired</p>
              <p className="mt-2 text-2xl font-medium text-[#2d2926]">{COHORTS.reduce((s, c) => s + c.size, 0).toLocaleString()}</p>
            </div>
            <div className="rounded border border-[#e8e0d8] bg-white p-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">Best Cohort</p>
              <p className="mt-2 text-2xl font-medium text-[#2d2926]">Dec '25</p>
              <p className="text-[10px] text-[#9a8d82]">65% M1, 52% M2</p>
            </div>
          </div>

          {/* ── Retention Heatmap ── */}
          <div className="rounded border border-[#e8e0d8] bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f3ece4] text-[#9a8d82] text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 text-left">Cohort</th>
                  <th className="px-4 py-2.5 text-right">Size</th>
                  {["M0", "M1", "M2", "M3", "M4", "M5"].map((m) => (
                    <th key={m} className="px-3 py-2.5 text-center">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e0d8]">
                {COHORTS.map((row) => (
                  <tr key={row.cohort}>
                    <td className="px-4 py-2.5 font-medium text-[#2d2926]">{row.cohort}</td>
                    <td className="px-4 py-2.5 text-right text-[#6b5e54]">{row.size}</td>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <td key={i} className="px-3 py-2.5 text-center">
                        {row.retention[i] !== undefined ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${cellColor(row.retention[i])}`}>
                            {row.retention[i]}%
                          </span>
                        ) : (
                          <span className="text-[#e8e0d8]">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === "forecast" && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="rounded border border-[#e8e0d8] bg-white p-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">Next Quarter Forecast</p>
              <p className="mt-2 text-2xl font-medium text-[#2d2926]">₹16.9L</p>
              <p className="text-[10px] text-green-600">+18% projected growth</p>
            </div>
            <div className="rounded border border-[#e8e0d8] bg-white p-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">Forecast Accuracy</p>
              <p className="mt-2 text-2xl font-medium text-[#2d2926]">94.2%</p>
              <p className="text-[10px] text-[#9a8d82]">MAPE over last 6 months</p>
            </div>
            <div className="rounded border border-[#e8e0d8] bg-white p-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">Experiment Revenue Lift</p>
              <p className="mt-2 text-2xl font-medium text-[#2d2926]">+₹42K</p>
              <p className="text-[10px] text-[#9a8d82]">From quiz-cta-position winner</p>
            </div>
          </div>

          {/* ── Revenue Chart ── */}
          <div className="rounded border border-[#e8e0d8] bg-white p-6">
            <h3 className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82] mb-4">
              Revenue: Actual vs Forecast (₹)
            </h3>
            <div className="flex items-end gap-2 h-48">
              {REVENUE.map((r) => (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-1 relative">
                  <span className="text-[8px] font-semibold text-[#2d2926]">
                    ₹{((r.actual ?? r.forecast) / 1000).toFixed(0)}k
                  </span>
                  <div className="w-full flex gap-0.5 items-end" style={{ height: `${((r.actual ?? r.forecast) / maxRevenue) * 100}%` }}>
                    {r.actual !== null && (
                      <div className="flex-1 bg-[#2d2926] rounded-t" style={{ height: "100%" }} />
                    )}
                    <div
                      className={`flex-1 rounded-t ${r.actual !== null ? "bg-[#c4a093]" : "bg-[#c4a093]/40 border border-dashed border-[#c4a093]"}`}
                      style={{ height: "100%" }}
                    />
                  </div>
                  <span className="text-[8px] text-[#9a8d82]">{r.month.split(" ")[0]}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <span className="flex items-center gap-1.5 text-[10px] text-[#6b5e54]">
                <span className="h-2 w-2 rounded-sm bg-[#2d2926]" /> Actual
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-[#6b5e54]">
                <span className="h-2 w-2 rounded-sm bg-[#c4a093]" /> Forecast
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
