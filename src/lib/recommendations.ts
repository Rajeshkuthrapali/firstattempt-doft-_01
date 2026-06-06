/**
 * ML Recommendation Engine (P5)
 *
 * Collaborative filtering + content-based hybrid recommendation system.
 * In production, the co-occurrence matrix would be trained on real
 * purchase/cart data and served via an inference endpoint.
 */

import { products, type Product } from "../data/products";

// ── Co-Occurrence Matrix (simulated training data) ───────────────────────────

/**
 * Simulated co-purchase frequency matrix.
 * Keys: product ID pairs. Values: co-purchase count.
 * In production, computed from `SELECT a.productId, b.productId, COUNT(*)
 * FROM order_items a JOIN order_items b ON a.orderId = b.orderId GROUP BY ...`.
 */
const CO_OCCURRENCE: Record<string, Record<string, number>> = {
  "lum-001": { "lum-002": 24, "lum-003": 18, "lum-004": 12, "lum-005": 8, "lum-006": 6 },
  "lum-002": { "lum-001": 24, "lum-003": 15, "lum-005": 20, "lum-006": 10 },
  "lum-003": { "lum-001": 18, "lum-002": 15, "lum-004": 22, "lum-006": 14 },
  "lum-004": { "lum-001": 12, "lum-003": 22, "lum-005": 16, "lum-006": 8 },
  "lum-005": { "lum-002": 20, "lum-004": 16, "lum-006": 12 },
  "lum-006": { "lum-002": 10, "lum-003": 14, "lum-004": 8, "lum-005": 12 },
};

// ── Scent Profile Affinity Weights ───────────────────────────────────────────

const PROFILE_NOTES: Record<string, string[]> = {
  woody: ["cedarwood", "sandalwood", "oud", "amber", "leather", "pine"],
  floral: ["jasmine", "rose", "lavender", "peony", "ylang-ylang", "violet"],
  fresh: ["sea salt", "bergamot", "eucalyptus", "mint", "citrus", "lemongrass"],
  spicy: ["cinnamon", "cardamom", "black pepper", "clove", "ginger", "nutmeg"],
};

// ── Scoring Functions ────────────────────────────────────────────────────────

interface ScoredProduct extends Product {
  score: number;
  reason: "collaborative" | "content" | "hybrid";
}

/**
 * Collaborative filtering: recommends products that are
 * frequently bought together with items the user has interacted with.
 */
export function collaborativeRecommendations(
  interactedProductIds: string[],
  limit = 4,
): ScoredProduct[] {
  const scores = new Map<string, number>();

  for (const id of interactedProductIds) {
    const coProducts = CO_OCCURRENCE[id];
    if (!coProducts) continue;
    for (const [coId, freq] of Object.entries(coProducts)) {
      if (interactedProductIds.includes(coId)) continue; // skip already-seen
      scores.set(coId, (scores.get(coId) || 0) + freq);
    }
  }

  return products
    .filter((p) => scores.has(p.id) && p.inStock)
    .map((p) => ({ ...p, score: scores.get(p.id) || 0, reason: "collaborative" as const }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Content-based: recommends products whose fragrance notes
 * align with the user's scent profile from the quiz.
 */
export function contentBasedRecommendations(
  scentProfile: string,
  excludeIds: string[] = [],
  limit = 4,
): ScoredProduct[] {
  const targetNotes = (PROFILE_NOTES[scentProfile.toLowerCase()] || []);

  return products
    .filter((p) => p.inStock && !excludeIds.includes(p.id))
    .map((p) => {
      const overlap = p.notes.filter((n) =>
        targetNotes.includes(n.toLowerCase()),
      ).length;
      return { ...p, score: overlap, reason: "content" as const };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Hybrid recommendation: combines collaborative and content-based scores
 * with configurable weights. Default: 60% collaborative, 40% content.
 */
export function hybridRecommendations(
  interactedProductIds: string[],
  scentProfile?: string,
  options: { collabWeight?: number; contentWeight?: number; limit?: number } = {},
): ScoredProduct[] {
  const { collabWeight = 0.6, contentWeight = 0.4, limit = 4 } = options;

  const collabResults = collaborativeRecommendations(interactedProductIds, 10);
  const contentResults = scentProfile
    ? contentBasedRecommendations(scentProfile, interactedProductIds, 10)
    : [];

  const combined = new Map<string, { product: Product; score: number }>();

  for (const r of collabResults) {
    combined.set(r.id, {
      product: r,
      score: r.score * collabWeight,
    });
  }

  for (const r of contentResults) {
    const existing = combined.get(r.id);
    if (existing) {
      existing.score += r.score * contentWeight;
    } else {
      combined.set(r.id, {
        product: r,
        score: r.score * contentWeight,
      });
    }
  }

  return Array.from(combined.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => ({
      ...entry.product,
      score: Math.round(entry.score * 100) / 100,
      reason: "hybrid" as const,
    }));
}

// ── Adaptive Quiz Intelligence ───────────────────────────────────────────────

/**
 * Determines whether the quiz can be shortened based on purchase history.
 * If the user has prior purchase data, we can infer their profile
 * and skip quiz questions accordingly.
 */
export function inferProfileFromHistory(
  purchasedProductIds: string[],
): { profile: string; confidence: number } | null {
  if (purchasedProductIds.length < 2) return null;

  const profileScores: Record<string, number> = { woody: 0, floral: 0, fresh: 0, spicy: 0 };

  for (const id of purchasedProductIds) {
    const product = products.find((p) => p.id === id);
    if (!product) continue;
    for (const note of product.notes) {
      const lower = note.toLowerCase();
      for (const [profile, notes] of Object.entries(PROFILE_NOTES)) {
        if (notes.includes(lower)) {
          profileScores[profile] += 1;
        }
      }
    }
  }

  const total = Object.values(profileScores).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const sorted = Object.entries(profileScores).sort(([, a], [, b]) => b - a);
  const [topProfile, topScore] = sorted[0];
  const confidence = topScore / total;

  // Only infer if confidence > 50%
  return confidence > 0.5 ? { profile: topProfile, confidence: Math.round(confidence * 100) } : null;
}
