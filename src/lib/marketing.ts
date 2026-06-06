/**
 * Marketing & Automation Webhooks Module (P3 Scaffold)
 * 
 * Provides utility functions to trigger marketing workflows
 * (like abandoned cart recovery) and recommendation engines.
 * 
 * In production, this would integrate with a node backend
 * dispatching emails via Resend or SendGrid.
 */

interface CartItemData {
  id: string;
  name: string;
  price: number;
}

/**
 * Dispatches a webhook to the marketing service when a cart is abandoned.
 * Provides user details and cart contents for recovery email rendering.
 */
export async function triggerAbandonedCartRecovery(
  userEmail: string,
  userId: string,
  cartItems: CartItemData[],
  totalValue: number
) {
  const payload = {
    event: "cart_abandoned",
    timestamp: new Date().toISOString(),
    customer: { email: userEmail, id: userId },
    cart: { items: cartItems, value: totalValue },
  };

  try {
    const res = await fetch("/api/webhooks/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Marketing service rejected webhook.");
    console.log("[Marketing] Abandoned Cart Recovery dispatched.", payload);
  } catch (err) {
    console.error("[Marketing] Failed to dispatch workflow:", err);
  }
}

/**
 * Pseudo-recommendation Engine
 * 
 * Recommends products based on the items currently in the user's cart
 * by matching categories or complementary tags.
 */
export function getPersonalizedRecommendations(cartIds: string[]) {
  // Mocked response logic: If they added "Golden Hour", recommend "Midnight Oud".
  const map: Record<string, string[]> = {
    "lum-001": ["lum-002", "lum-003"], // Golden Hour -> Midnight Oud, Cedarwood Bliss
    "lum-002": ["lum-001", "lum-004"],
    "lum-003": ["lum-001", "lum-002"],
    "lum-004": ["lum-002", "lum-003"],
  };

  const recommendedSet = new Set<string>();
  cartIds.forEach((id) => {
    if (map[id]) map[id].forEach((r) => recommendedSet.add(r));
  });

  cartIds.forEach((id) => recommendedSet.delete(id)); // remove already-in-cart items

  return Array.from(recommendedSet);
}

/**
 * Triggers a personalized email campaign with scent recommendations
 * based on the user's completed Scent Match quiz profile.
 */
export async function triggerQuizRecommendationEmail(userEmail: string, scentProfile: string) {
  console.log(`[Marketing] Dispatching ${scentProfile} recommendations to ${userEmail}...`);
  // fetch POST to /api/webhooks/marketing/quiz-result
}

/**
 * Sends a welcome/reward email when a user unlocks a new Loyalty Tier.
 */
export async function triggerLoyaltyUnlockEmail(userEmail: string, newTier: string) {
  console.log(`[Marketing] Dispatching Tier Unlock (${newTier}) to ${userEmail}...`);
  // fetch POST to /api/webhooks/marketing/loyalty-unlock
}
