import { useState } from "react";

interface LoyaltyMetrics {
  totalMembers: number;
  activeRedeemers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  pointsExpiringSoon: number;
  redemptionRate: number;
  avgPointsPerMember: number;
}

interface TierDistribution {
  tier: string;
  count: number;
  pct: number;
  color: string;
}

const MOCK_METRICS: LoyaltyMetrics = {
  totalMembers: 2847,
  activeRedeemers: 412,
  pointsIssued: 1_420_000,
  pointsRedeemed: 380_000,
  pointsExpiringSoon: 45_200,
  redemptionRate: 26.8,
  avgPointsPerMember: 499,
};

const TIER_DIST: TierDistribution[] = [
  { tier: "Bronze", count: 1820, pct: 63.9, color: "bg-amber-400" },
  { tier: "Silver", count: 680, pct: 23.9, color: "bg-gray-400" },
  { tier: "Gold", count: 280, pct: 9.8, color: "bg-yellow-400" },
  { tier: "Platinum", count: 67, pct: 2.4, color: "bg-purple-500" },
];

const MONTHLY_REDEMPTIONS = [
  { month: "Oct", value: 28000 },
  { month: "Nov", value: 42000 },
  { month: "Dec", value: 68000 },
  { month: "Jan", value: 52000 },
  { month: "Feb", value: 61000 },
  { month: "Mar", value: 74000 },
];

/**
 * Admin Loyalty Dashboard — redemption metrics, tier distribution,
 * points liability, and monthly redemption trends.
 */
export default function AdminLoyalty() {
  const [timeframe] = useState<"30d" | "90d" | "all">("all");
  const maxRedemption = Math.max(...MONTHLY_REDEMPTIONS.map((m) => m.value));

  return (
    <div>
      <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926] mb-2">
        Loyalty Analytics
      </h1>
      <p className="text-xs text-[#9a8d82] mb-8">
        Membership health, redemption trends, and points liability · Timeframe: {timeframe}
      </p>

      {/* ── Summary Cards ── */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[
          { label: "Total Members", value: MOCK_METRICS.totalMembers.toLocaleString(), sub: `${MOCK_METRICS.activeRedeemers} active redeemers` },
          { label: "Redemption Rate", value: `${MOCK_METRICS.redemptionRate}%`, sub: "Points redeemed / issued" },
          { label: "Points Liability", value: `₹${((MOCK_METRICS.pointsIssued - MOCK_METRICS.pointsRedeemed) / 500 * 100).toLocaleString()}`, sub: `${(MOCK_METRICS.pointsIssued - MOCK_METRICS.pointsRedeemed).toLocaleString()} pts outstanding` },
          { label: "Expiring (30d)", value: MOCK_METRICS.pointsExpiringSoon.toLocaleString(), sub: "Points expiring soon" },
        ].map((card) => (
          <div key={card.label} className="rounded border border-[#e8e0d8] bg-white p-5">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82]">{card.label}</p>
            <p className="mt-2 text-2xl font-medium text-[#2d2926]">{card.value}</p>
            <p className="text-[10px] text-[#9a8d82] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Tier Distribution ── */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="rounded border border-[#e8e0d8] bg-white p-6">
          <h3 className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82] mb-4">Tier Distribution</h3>
          <div className="flex h-4 rounded-full overflow-hidden bg-[#f3ece4] mb-4">
            {TIER_DIST.map((t) => (
              <div key={t.tier} className={`${t.color} transition-all`} style={{ width: `${t.pct}%` }} title={`${t.tier}: ${t.pct}%`} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIER_DIST.map((t) => (
              <div key={t.tier} className="flex items-center gap-2 text-xs text-[#6b5e54]">
                <span className={`inline-block h-2 w-2 rounded-full ${t.color}`} />
                {t.tier}: {t.count.toLocaleString()} ({t.pct}%)
              </div>
            ))}
          </div>
        </div>

        {/* ── Monthly Redemptions Chart ── */}
        <div className="rounded border border-[#e8e0d8] bg-white p-6">
          <h3 className="text-[10px] uppercase font-semibold tracking-wider text-[#9a8d82] mb-4">Monthly Redemptions (pts)</h3>
          <div className="flex items-end gap-3 h-32">
            {MONTHLY_REDEMPTIONS.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold text-[#2d2926]">{(m.value / 1000).toFixed(0)}k</span>
                <div
                  className="w-full bg-[#c4a093] rounded-t transition-all"
                  style={{ height: `${(m.value / maxRedemption) * 100}%` }}
                />
                <span className="text-[9px] text-[#9a8d82]">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
