import { useState, useEffect, useCallback } from "react";
import { predictLTV, type LTVPrediction } from "../../lib/ltv-fraud";
import { assessFraudRisk, type FraudAssessment } from "../../lib/ltv-fraud";

const MOCK_LTV_INPUTS = [
  { customerId: "c001", totalOrders: 18, totalRevenue: 54000, daysSinceFirstOrder: 280, avgOrderFrequencyDays: 16, loyaltyTier: "Gold", returnRate: 0.05, emailEngagement: 0.72, referralCount: 3 },
  { customerId: "c002", totalOrders: 4, totalRevenue: 8200, daysSinceFirstOrder: 95, avgOrderFrequencyDays: 24, loyaltyTier: "Silver", returnRate: 0.10, emailEngagement: 0.45, referralCount: 0 },
  { customerId: "c003", totalOrders: 1, totalRevenue: 2100, daysSinceFirstOrder: 180, avgOrderFrequencyDays: 180, loyaltyTier: "Bronze", returnRate: 0.00, emailEngagement: 0.12, referralCount: 0 },
  { customerId: "c004", totalOrders: 32, totalRevenue: 112000, daysSinceFirstOrder: 420, avgOrderFrequencyDays: 13, loyaltyTier: "Platinum", returnRate: 0.02, emailEngagement: 0.90, referralCount: 8 },
];

const SEGMENT_COLORS: Record<string, string> = {
  champion: "bg-emerald-100 text-emerald-800",
  loyal: "bg-blue-100 text-blue-800",
  potential: "bg-sky-100 text-sky-700",
  "at-risk": "bg-amber-100 text-amber-800",
  dormant: "bg-red-100 text-red-700",
};

const FRAUD_RISK_COLOR: Record<string, string> = {
  low: "text-green-600",
  medium: "text-amber-600",
  high: "text-red-600",
  block: "text-red-800 font-bold",
};

interface FraudEvent {
  id: string;
  time: string;
  assessment: FraudAssessment;
  amount: number;
  country: string;
}

let fraudIdx = 0;
const MOCK_FRAUD_SIGNALS = [
  { amount: 28000, currency: "INR", customerId: "cx-9", ipAddress: "203.0.113.1", userAgent: "Mozilla", shippingCountry: "RU", billingCountry: "IN", cardBin: "411100", velocityLast1h: 1, velocityLast24h: 3, avgOrderValue: 2800, isNewCustomer: true, isNewDevice: true },
  { amount: 1800, currency: "INR", customerId: "cx-12", ipAddress: "122.1.4.5", userAgent: "Chrome", shippingCountry: "IN", billingCountry: "IN", cardBin: "525412", velocityLast1h: 0, velocityLast24h: 2, avgOrderValue: 2200, isNewCustomer: false, isNewDevice: false },
  { amount: 15000, currency: "INR", customerId: "cx-4", ipAddress: "91.2.3.100", userAgent: "Safari", shippingCountry: "AE", billingCountry: "GB", cardBin: "340000", velocityLast1h: 5, velocityLast24h: 8, avgOrderValue: 4000, isNewCustomer: false, isNewDevice: true },
  { amount: 3200, currency: "INR", customerId: "cx-7", ipAddress: "49.8.12.3", userAgent: "Firefox", shippingCountry: "IN", billingCountry: "IN", cardBin: "427022", velocityLast1h: 0, velocityLast24h: 1, avgOrderValue: 3100, isNewCustomer: false, isNewDevice: false },
];

/** Real-time admin dashboard for fraud alerts and LTV segment monitoring. */
export default function AdminIntelligence() {
  const [tab, setTab] = useState<"ltv" | "fraud">("ltv");
  const [fraudEvents, setFraudEvents] = useState<FraudEvent[]>([]);
  const [ltvPredictions] = useState<LTVPrediction[]>(
    MOCK_LTV_INPUTS.map((i) => predictLTV(i))
  );

  const addFraudEvent = useCallback(() => {
    const signals = MOCK_FRAUD_SIGNALS[fraudIdx % MOCK_FRAUD_SIGNALS.length];
    fraudIdx += 1;
    const assessment = assessFraudRisk({ transactionId: `tx-${Date.now()}`, ...signals });
    setFraudEvents((prev) => [
      { id: assessment.transactionId, time: new Date().toLocaleTimeString(), assessment, amount: signals.amount, country: signals.shippingCountry },
      ...prev,
    ].slice(0, 20));
  }, []);

  useEffect(() => {
    const t = setInterval(addFraudEvent, 6000);
    const timer = setTimeout(addFraudEvent, 100);
    return () => { clearInterval(t); clearTimeout(timer); };
  }, [addFraudEvent]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926]">Commerce Intelligence</h1>
          <p className="text-xs text-[#9a8d82] mt-1">Real-time fraud monitoring and LTV analytics</p>
        </div>
        <div className="flex gap-1 rounded border border-[#e8e0d8] p-0.5">
          {(["ltv", "fraud"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest rounded transition-colors ${tab === t ? "bg-[#2d2926] text-white" : "text-[#6b5e54] hover:bg-[#f3ece4]"}`}>
              {t === "ltv" ? "LTV Segments" : "Fraud Alerts"}
            </button>
          ))}
        </div>
      </div>

      {tab === "ltv" && (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {(["champion", "loyal", "potential", "at-risk"] as const).map((seg) => {
              const count = ltvPredictions.filter((p) => p.segment === seg).length;
              const totalLTV = ltvPredictions.filter((p) => p.segment === seg).reduce((s, p) => s + p.predictedLTV12m, 0);
              return (
                <div key={seg} className="rounded border border-[#e8e0d8] bg-white p-4">
                  <span className={`inline-block text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${SEGMENT_COLORS[seg]}`}>{seg}</span>
                  <p className="mt-2 text-xl font-medium text-[#2d2926]">{count} customers</p>
                  <p className="text-[10px] text-[#9a8d82]">₹{totalLTV.toLocaleString()} projected 12m</p>
                </div>
              );
            })}
          </div>
          <div className="rounded border border-[#e8e0d8] bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f3ece4] text-[#9a8d82] text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Segment</th>
                  <th className="px-4 py-2.5 text-right">Current LTV</th>
                  <th className="px-4 py-2.5 text-right">12m Forecast</th>
                  <th className="px-4 py-2.5 text-right">Growth</th>
                  <th className="px-4 py-2.5 text-left">Top Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e0d8]">
                {ltvPredictions.map((p) => (
                  <tr key={p.customerId} className="hover:bg-[#faf7f4]">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-[#6b5e54]">{p.customerId}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${SEGMENT_COLORS[p.segment]}`}>{p.segment}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-[#2d2926]">₹{p.currentLTV.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-[#2d2926]">₹{p.predictedLTV12m.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={p.growthPotential > 50 ? "text-green-600" : p.growthPotential > 20 ? "text-amber-600" : "text-[#9a8d82]"}>+{p.growthPotential}%</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#6b5e54]">{p.recommendations[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "fraud" && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider text-red-600 font-semibold">Live monitoring</span>
          </div>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {(["low", "medium", "high", "block"] as const).map((level) => {
              const count = fraudEvents.filter((e) => e.assessment.riskLevel === level).length;
              return (
                <div key={level} className="rounded border border-[#e8e0d8] bg-white p-4">
                  <p className={`text-[10px] uppercase font-semibold tracking-wider ${FRAUD_RISK_COLOR[level]}`}>{level}</p>
                  <p className="mt-2 text-2xl font-medium text-[#2d2926]">{count}</p>
                </div>
              );
            })}
          </div>
          <div className="rounded border border-[#e8e0d8] bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f3ece4] text-[#9a8d82] text-[10px] uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left w-20">Time</th>
                  <th className="px-4 py-2.5 text-left">Transaction</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-center">Risk</th>
                  <th className="px-4 py-2.5 text-center">Score</th>
                  <th className="px-4 py-2.5 text-left">Action</th>
                  <th className="px-4 py-2.5 text-left">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e0d8]">
                {fraudEvents.map((ev) => (
                  <tr key={ev.id} className={ev.assessment.riskLevel === "block" ? "bg-red-50/50" : "hover:bg-[#faf7f4]"}>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-[#9a8d82]">{ev.time}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-[#6b5e54]">{ev.id.slice(0, 16)}</td>
                    <td className="px-4 py-2.5 text-right text-[#2d2926]">₹{ev.amount.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-[10px] font-bold uppercase ${FRAUD_RISK_COLOR[ev.assessment.riskLevel]}`}>{ev.assessment.riskLevel}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-[#6b5e54] text-xs">{ev.assessment.riskScore}</td>
                    <td className="px-4 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-[#2d2926]">{ev.assessment.action}</td>
                    <td className="px-4 py-2.5 text-[10px] text-[#9a8d82]">{ev.assessment.flags[0] || "—"}</td>
                  </tr>
                ))}
                {fraudEvents.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[#9a8d82]">Waiting for events…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
