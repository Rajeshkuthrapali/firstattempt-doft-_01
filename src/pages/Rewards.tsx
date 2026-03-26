import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../lib/format";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  type: "product" | "discount" | "experience";
}

const REWARDS: Reward[] = [
  { id: "rw-001", name: "Mini Candle Set", description: "Three 60g travel-sized signature candles.", pointsCost: 500, image: "/golden-hour.png", tier: "Bronze", type: "product" },
  { id: "rw-002", name: "₹200 Store Credit", description: "Applied automatically at checkout.", pointsCost: 800, image: "/midnight-oud.png", tier: "Bronze", type: "discount" },
  { id: "rw-003", name: "Limited Edition Candle", description: "Exclusive seasonal release, members only.", pointsCost: 1500, image: "/cedarwood-bliss.png", tier: "Silver", type: "product" },
  { id: "rw-004", name: "Free Gift Wrapping", description: "Premium gift wrapping on your next 3 orders.", pointsCost: 300, image: "/lavender-dream.png", tier: "Bronze", type: "experience" },
  { id: "rw-005", name: "₹500 Store Credit", description: "Applied automatically at checkout.", pointsCost: 1800, image: "/golden-hour.png", tier: "Gold", type: "discount" },
  { id: "rw-006", name: "Candle Making Workshop", description: "Exclusive virtual workshop with our master chandler.", pointsCost: 3000, image: "/midnight-oud.png", tier: "Platinum", type: "experience" },
];

const TIER_COLORS: Record<string, string> = {
  Bronze: "bg-amber-100 text-amber-800",
  Silver: "bg-gray-100 text-gray-700",
  Gold: "bg-yellow-100 text-yellow-800",
  Platinum: "bg-purple-100 text-purple-800",
};

const MOCK_POINTS = 1250;
const MOCK_TIER = "Silver";

/**
 * Rewards catalog page — browse and redeem loyalty rewards.
 * Points balance and tier shown at top; each reward shows cost and eligibility.
 */
export default function Rewards() {
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [points, setPoints] = useState(MOCK_POINTS);

  const handleRedeem = (reward: Reward) => {
    if (points < reward.pointsCost) return;
    setPoints((prev) => prev - reward.pointsCost);
    setRedeemed((prev) => [...prev, reward.id]);
  };

  const tierOrder = ["Bronze", "Silver", "Gold", "Platinum"];
  const userTierIndex = tierOrder.indexOf(MOCK_TIER);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-['Cormorant_Garamond',serif] text-4xl font-semibold text-[#2d2926] mb-2">
        Rewards
      </h1>
      <p className="text-sm text-[#6b5e54] mb-10">
        Redeem your loyalty points for exclusive products, discounts, and experiences.
      </p>

      {/* ── Points Summary ── */}
      <div className="rounded-xl bg-gradient-to-r from-[#2d2926] to-[#6b5e54] text-white p-8 mb-12 flex flex-col md:flex-row items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">Your Balance</p>
          <p className="text-4xl font-medium">{points.toLocaleString()} <span className="text-lg text-white/70">pts</span></p>
        </div>
        <div className="mt-4 md:mt-0 text-center md:text-right">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${TIER_COLORS[MOCK_TIER]}`}>
            {MOCK_TIER} Tier
          </span>
          <p className="text-[11px] text-white/60 mt-2">
            <Link to="/account/loyalty" className="underline hover:text-white">View tier benefits →</Link>
          </p>
        </div>
      </div>

      {/* ── Reward Grid ── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {REWARDS.map((reward) => {
          const tierIndex = tierOrder.indexOf(reward.tier);
          const locked = tierIndex > userTierIndex;
          const alreadyRedeemed = redeemed.includes(reward.id);
          const canAfford = points >= reward.pointsCost;

          return (
            <div
              key={reward.id}
              className={`rounded-lg border bg-white overflow-hidden transition-colors ${
                locked ? "border-[#e8e0d8] opacity-60" : "border-[#e8e0d8] hover:border-[#c4a093]"
              }`}
            >
              <div className="h-40 overflow-hidden">
                <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full ${TIER_COLORS[reward.tier]}`}>
                    {reward.tier}
                  </span>
                  <span className="text-[10px] text-[#9a8d82] capitalize">{reward.type}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#2d2926] mb-1">{reward.name}</h3>
                <p className="text-xs text-[#6b5e54] mb-3">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#2d2926]">{reward.pointsCost.toLocaleString()} pts</span>
                  {alreadyRedeemed ? (
                    <span className="text-[10px] uppercase tracking-wider text-green-700 font-semibold">Redeemed ✓</span>
                  ) : locked ? (
                    <span className="text-[10px] uppercase tracking-wider text-[#9a8d82]">Locked</span>
                  ) : (
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className="px-4 py-1.5 text-[10px] uppercase tracking-widest bg-[#2d2926] text-white rounded-sm hover:bg-[#c4a093] disabled:opacity-40 transition-colors"
                    >
                      Redeem
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Points-at-Checkout Explainer ── */}
      <div className="mt-16 rounded-lg border border-[#e8e0d8] bg-[#f3ece4] p-8 text-center">
        <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-medium text-[#2d2926] mb-3">
          Use Points at Checkout
        </h2>
        <p className="text-sm text-[#6b5e54] max-w-lg mx-auto mb-4">
          Apply your loyalty points as currency during checkout. Every 500 points = {formatPrice(100)} off your order. 
          Points are automatically applied when you&apos;re signed in.
        </p>
        <Link
          to="/collections"
          className="inline-block bg-[#2d2926] text-white px-6 py-2.5 text-[10px] uppercase tracking-widest hover:bg-[#c4a093] transition-colors"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}
