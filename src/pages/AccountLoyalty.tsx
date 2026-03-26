import { useAuthStore } from "../stores/auth";
import { Link } from "react-router-dom";

/**
 * AccountLoyalty — dashboard for the Lumière Club loyalty program.
 * Displays points balance, tier progress, and available rewards.
 */
export default function AccountLoyalty() {
  const user = useAuthStore((s) => s.user) as { loyaltyPoints?: number, loyaltyTier?: string } | null;

  // Mocked loyalty context (in production, fetch from /api/loyalty based on user id)
  const loyaltyPoints = user?.loyaltyPoints ?? 1250;
  const loyaltyTier = user?.loyaltyTier ?? "Silver";

  const tiers = [
    { name: "Member", min: 0 },
    { name: "Silver", min: 1000 },
    { name: "Gold", min: 3000 },
    { name: "Platinum", min: 5000 },
  ];

  const currentTierIndex = tiers.findIndex((t) => t.name === loyaltyTier);
  const nextTier =
    currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

  const progressToNext = nextTier
    ? Math.min(
        100,
        ((loyaltyPoints - tiers[currentTierIndex].min) /
          (nextTier.min - tiers[currentTierIndex].min)) *
          100
      )
    : 100;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-baseline justify-between border-b border-[#e8e0d8] pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#9a8d82] mb-2">
            Lumière Club
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-4xl font-medium text-[#2d2926]">
            Loyalty Dashboard
          </h1>
        </div>
        <Link
          to="/account"
          className="text-[11px] uppercase tracking-[0.15em] text-[#c4a093] hover:text-[#2d2926] transition-colors"
        >
          ← Back to Account
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        {/* Main Status */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-[#e8e0d8] bg-[#faf7f4] p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#2d2926]">Current Balance</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-5xl font-['Cormorant_Garamond',serif] font-medium text-[#c4a093]">
                    {loyaltyPoints}
                  </span>
                  <span className="text-sm text-[#9a8d82]">pts</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="rounded-full bg-[#c4a093] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                  {loyaltyTier} Status
                </span>
                {nextTier && (
                  <p className="mt-2 text-xs text-[#6b5e54]">
                    {nextTier.min - loyaltyPoints} pts to {nextTier.name}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {nextTier ? (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[#9a8d82] mb-2">
                  <span>{loyaltyTier}</span>
                  <span>{nextTier.name} ({nextTier.min} pts)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8e0d8]">
                  <div
                    className="h-full bg-[#c4a093] transition-all duration-1000 ease-out"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#9a8d82]">
                Highest Tier Achieved
              </p>
            )}
          </div>

          {/* Available Rewards */}
          <div>
            <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-medium text-[#2d2926] mb-4">
              Available Rewards
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#e8e0d8] bg-white p-5 hover:border-[#c4a093] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium text-[#2d2926]">₹500 Off</span>
                  <span className="text-xs font-semibold text-[#c4a093]">500 pts</span>
                </div>
                <p className="text-xs text-[#6b5e54] mb-4">Redeem on your next purchase.</p>
                <button
                  disabled={loyaltyPoints < 500}
                  className="w-full rounded bg-[#2d2926] py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Redeem
                </button>
              </div>
              <div className="rounded-lg border border-[#e8e0d8] bg-white p-5 hover:border-[#c4a093] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium text-[#2d2926]">Free Gift Wrap</span>
                  <span className="text-xs font-semibold text-[#c4a093]">250 pts</span>
                </div>
                <p className="text-xs text-[#6b5e54] mb-4">Premium packaging for any order.</p>
                <button
                  disabled={loyaltyPoints < 250}
                  className="w-full rounded bg-[#2d2926] py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="rounded-lg bg-[#f3ece4] p-6 text-sm text-[#4a3f37]">
            <h3 className="font-medium text-[#2d2926] mb-2 text-lg font-['Cormorant_Garamond',serif]">
              How it works
            </h3>
            <ul className="list-disc pl-4 space-y-2 text-xs">
              <li>Earn 1 point for every ₹10 spent.</li>
              <li>Points expire after 12 months of inactivity.</li>
              <li>Silver status grants access to private sales.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
