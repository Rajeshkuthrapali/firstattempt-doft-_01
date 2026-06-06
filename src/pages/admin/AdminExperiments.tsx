import { useState } from "react";
import {
  EXPERIMENTS,
  MOCK_RESULTS,
  type Experiment,
  type ExperimentStatus,
} from "../../lib/ab-testing";

const STATUS_STYLES: Record<ExperimentStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  running: "bg-green-50 text-green-700",
  paused: "bg-amber-50 text-amber-700",
  completed: "bg-blue-50 text-blue-700",
};

/**
 * Admin Experiments Dashboard — view active experiments,
 * variant allocations, and simulated conversion data.
 */
export default function AdminExperiments() {
  const [selected, setSelected] = useState<Experiment | null>(null);

  const results = selected
    ? MOCK_RESULTS.filter((r) => r.experimentId === selected.id)
    : [];

  return (
    <div>
      <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926] mb-2">
        A/B Experiments
      </h1>
      <p className="text-sm text-[#9a8d82] mb-8">
        Manage experiments and track conversion performance.
      </p>

      {/* ── Experiment Cards ── */}
      <div className="grid gap-4 md:grid-cols-3 mb-10">
        {EXPERIMENTS.map((exp) => (
          <button
            key={exp.id}
            onClick={() => setSelected(exp)}
            className={`text-left p-5 rounded-lg border transition-colors ${
              selected?.id === exp.id
                ? "border-[#c4a093] bg-[#faf7f4]"
                : "border-[#e8e0d8] bg-white hover:border-[#c4a093]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[9px] uppercase font-semibold tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLES[exp.status]}`}
              >
                {exp.status}
              </span>
              <span className="text-[10px] text-[#9a8d82]">
                {exp.variants.length} variants
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[#2d2926] mb-1">{exp.name}</h3>
            <p className="text-xs text-[#6b5e54] line-clamp-2">{exp.description}</p>
          </button>
        ))}
      </div>

      {/* ── Detail Panel ── */}
      {selected && (
        <div className="rounded-lg border border-[#e8e0d8] bg-white p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#2d2926]">{selected.name}</h2>
              <p className="text-xs text-[#9a8d82] mt-1">
                Goal: <code className="bg-[#f3ece4] px-1.5 py-0.5 rounded text-[11px]">{selected.goalEvent}</code>
                {selected.startedAt && (
                  <> · Started {new Date(selected.startedAt).toLocaleDateString()}</>
                )}
              </p>
            </div>
            <span className={`text-[9px] uppercase font-semibold tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLES[selected.status]}`}>
              {selected.status}
            </span>
          </div>

          {/* Variant Allocation */}
          <h3 className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82] mb-3">
            Traffic Allocation
          </h3>
          <div className="flex h-3 rounded-full overflow-hidden mb-6 bg-[#f3ece4]">
            {selected.variants.map((v, i) => {
              const colors = ["bg-[#2d2926]", "bg-[#c4a093]", "bg-[#9a8d82]", "bg-[#6b5e54]"];
              return (
                <div
                  key={v.id}
                  className={`${colors[i % colors.length]} transition-all`}
                  style={{ width: `${v.weight}%` }}
                  title={`${v.label}: ${v.weight}%`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mb-8">
            {selected.variants.map((v, i) => {
              const dots = ["bg-[#2d2926]", "bg-[#c4a093]", "bg-[#9a8d82]", "bg-[#6b5e54]"];
              return (
                <div key={v.id} className="flex items-center gap-2 text-xs text-[#6b5e54]">
                  <span className={`inline-block h-2 w-2 rounded-full ${dots[i % dots.length]}`} />
                  {v.label} ({v.weight}%)
                </div>
              );
            })}
          </div>

          {/* Conversion Results */}
          {results.length > 0 && (
            <>
              <h3 className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82] mb-3">
                Conversion Results
              </h3>
              <div className="rounded border border-[#e8e0d8] overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f3ece4] text-[#9a8d82] text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Variant</th>
                      <th className="px-4 py-2.5 text-right">Exposures</th>
                      <th className="px-4 py-2.5 text-right">Conversions</th>
                      <th className="px-4 py-2.5 text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e0d8]">
                    {results.map((r) => {
                      const variant = selected.variants.find((v) => v.id === r.variantId);
                      const isWinner = r.conversionRate === Math.max(...results.map((x) => x.conversionRate));
                      return (
                        <tr key={r.variantId} className={isWinner ? "bg-green-50/30" : ""}>
                          <td className="px-4 py-3 font-medium text-[#2d2926]">
                            {variant?.label || r.variantId}
                            {isWinner && (
                              <span className="ml-2 text-[9px] text-green-700 font-semibold uppercase">Winner</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-[#6b5e54]">{r.exposures.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-[#6b5e54]">{r.conversions.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-semibold text-[#2d2926]">{r.conversionRate.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {results.length === 0 && (
            <p className="text-sm text-[#9a8d82] text-center py-6">
              No conversion data yet. Start the experiment to begin collecting results.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
