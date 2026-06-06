/**
 * Cross-Session Collaborative Filtering (P7)
 *
 * Extends the P5 recommendation engine with persistent user profiles
 * that accumulate across sessions. Enables:
 * - Cross-session product affinity scoring
 * - Personalized homepage hero selection
 * - Cart upsell recommendations
 */

import { products, type Product } from "../data/products";

// ── Persistent User Profile ──────────────────────────────────────────────────

export interface UserProfile {
  userId: string;
  viewedProducts: string[];
  purchasedProducts: string[];
  scentProfile: string | null;
  lastVisit: string;
  sessionCount: number;
}

const PROFILE_KEY = "lumiere_user_profile";

/** Loads or creates a persistent cross-session user profile. */
export function loadUserProfile(): UserProfile {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      const profile: UserProfile = JSON.parse(stored);
      profile.sessionCount += 1;
      profile.lastVisit = new Date().toISOString();
      saveUserProfile(profile);
      return profile;
    }
  } catch { /* fresh profile */ }

  const profile: UserProfile = {
    userId: crypto.randomUUID(),
    viewedProducts: [],
    purchasedProducts: [],
    scentProfile: null,
    lastVisit: new Date().toISOString(),
    sessionCount: 1,
  };
  saveUserProfile(profile);
  return profile;
}

/** Persists the user profile to localStorage. */
export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

/** Records a product view in the cross-session profile. */
export function recordView(productId: string): void {
  const profile = loadUserProfile();
  if (!profile.viewedProducts.includes(productId)) {
    profile.viewedProducts.push(productId);
    saveUserProfile(profile);
  }
}

/** Records a purchase in the cross-session profile. */
export function recordPurchase(productIds: string[]): void {
  const profile = loadUserProfile();
  for (const id of productIds) {
    if (!profile.purchasedProducts.includes(id)) {
      profile.purchasedProducts.push(id);
    }
  }
  saveUserProfile(profile);
}

/** Updates the scent profile from quiz results. */
export function recordScentProfile(scent: string): void {
  const profile = loadUserProfile();
  profile.scentProfile = scent;
  saveUserProfile(profile);
}

// ── Affinity Scoring ─────────────────────────────────────────────────────────

const PROFILE_NOTES: Record<string, string[]> = {
  woody: ["cedarwood", "sandalwood", "oud", "amber", "leather"],
  floral: ["jasmine", "rose", "lavender", "peony", "ylang-ylang"],
  fresh: ["sea salt", "bergamot", "eucalyptus", "mint", "citrus"],
  spicy: ["cinnamon", "cardamom", "black pepper", "clove", "ginger"],
};

interface ScoredProduct extends Product {
  affinityScore: number;
  reason: string;
}

/**
 * Cross-session affinity scorer — combines view frequency, purchase history,
 * and scent profile for a holistic recommendation score.
 */
export function getAffinityRecommendations(limit = 4): ScoredProduct[] {
  const profile = loadUserProfile();
  const excludeIds = new Set(profile.purchasedProducts);
  const scentNotes = profile.scentProfile
    ? (PROFILE_NOTES[profile.scentProfile.toLowerCase()] || [])
    : [];

  return products
    .filter((p) => p.inStock && !excludeIds.has(p.id))
    .map((p) => {
      let score = 0;
      let reason = "";

      // View frequency boost (diminishing returns)
      const viewCount = profile.viewedProducts.filter((v) => v === p.id).length;
      if (viewCount > 0) {
        score += Math.min(viewCount * 2, 8);
        reason = "Frequently viewed";
      }

      // Category affinity from purchases
      const purchasedCategories = profile.purchasedProducts
        .map((id) => products.find((pr) => pr.id === id)?.category)
        .filter(Boolean);
      if (purchasedCategories.includes(p.category)) {
        score += 5;
        reason = reason || "Similar to past purchases";
      }

      // Scent profile alignment
      const noteOverlap = p.notes.filter((n) =>
        scentNotes.includes(n.toLowerCase()),
      ).length;
      if (noteOverlap > 0) {
        score += noteOverlap * 3;
        reason = reason || `Matches your ${profile.scentProfile} profile`;
      }

      // New user boost for popular items
      if (profile.sessionCount <= 2 && score === 0) {
        score = 1;
        reason = "Popular choice";
      }

      return { ...p, affinityScore: score, reason };
    })
    .filter((p) => p.affinityScore > 0)
    .sort((a, b) => b.affinityScore - a.affinityScore)
    .slice(0, limit);
}

// ── Personalized Hero Selection ──────────────────────────────────────────────

export interface HeroPersonalization {
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundProduct: string;
}

const HERO_VARIANTS: Record<string, HeroPersonalization> = {
  woody: {
    headline: "Grounded Warmth",
    subtitle: "Cedar, sandalwood & amber for soul-deep comfort.",
    ctaText: "Explore Woody Collection",
    ctaLink: "/collections?scent=woody",
    backgroundProduct: "/cedarwood-bliss.png",
  },
  floral: {
    headline: "Petal Soft Evenings",
    subtitle: "Jasmine, rose & lavender to set the mood.",
    ctaText: "Explore Floral Collection",
    ctaLink: "/collections?scent=floral",
    backgroundProduct: "/lavender-dream.png",
  },
  fresh: {
    headline: "Breathe Deep",
    subtitle: "Sea salt, bergamot & citrus for clarity.",
    ctaText: "Explore Fresh Collection",
    ctaLink: "/collections?scent=fresh",
    backgroundProduct: "/golden-hour.png",
  },
  spicy: {
    headline: "Warm Intrigue",
    subtitle: "Cinnamon, cardamom & clove for bold moments.",
    ctaText: "Explore Spicy Collection",
    ctaLink: "/collections?scent=spicy",
    backgroundProduct: "/midnight-oud.png",
  },
  default: {
    headline: "Illuminate Your Space",
    subtitle: "Hand-poured luxury soy candles for every mood.",
    ctaText: "Shop the Collection",
    ctaLink: "/collections",
    backgroundProduct: "/golden-hour.png",
  },
};

/** Returns a personalized hero variant based on user profile. */
export function getPersonalizedHero(): HeroPersonalization {
  const profile = loadUserProfile();
  if (profile.scentProfile && HERO_VARIANTS[profile.scentProfile.toLowerCase()]) {
    return HERO_VARIANTS[profile.scentProfile.toLowerCase()];
  }
  return HERO_VARIANTS.default;
}

// ── Cart Upsell Engine ───────────────────────────────────────────────────────

/**
 * Returns upsell recommendations for the current cart.
 * Finds products that complement cart items via category diversity
 * and note-gap filling.
 */
export function getCartUpsells(
  cartProductIds: string[],
  limit = 2,
): ScoredProduct[] {
  const cartProducts = cartProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];
  const cartCategories = new Set(cartProducts.map((p) => p.category));
  const cartNotes = new Set(
    cartProducts.flatMap((p) => p.notes.map((n) => n.toLowerCase())),
  );

  return products
    .filter((p) => p.inStock && !cartProductIds.includes(p.id))
    .map((p) => {
      let score = 0;
      let reason = "";

      // Category complement — recommend from missing categories
      if (!cartCategories.has(p.category)) {
        score += 4;
        reason = "Complete your collection";
      }

      // Note complement — fills gaps in fragrance coverage
      const newNotes = p.notes.filter((n) => !cartNotes.has(n.toLowerCase()));
      if (newNotes.length > 0) {
        score += newNotes.length * 2;
        reason = reason || `Adds ${newNotes[0].toLowerCase()} notes`;
      }

      // Price complement — suggest lower-priced add-ons
      const avgCartPrice = cartProducts.reduce((s, c) => s + c.price, 0) / cartProducts.length;
      if (p.price < avgCartPrice * 0.7) {
        score += 2;
        reason = reason || "Great add-on value";
      }

      return { ...p, affinityScore: score, reason };
    })
    .filter((p) => p.affinityScore > 0)
    .sort((a, b) => b.affinityScore - a.affinityScore)
    .slice(0, limit);
}
