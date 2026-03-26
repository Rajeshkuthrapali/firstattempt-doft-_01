/**
 * A/B Testing Framework (P4 Scaffold)
 *
 * Lightweight client-side experiment assignment using
 * deterministic hashing. In production, this would integrate
 * with Vercel Edge Config or LaunchDarkly for server-side
 * feature flag evaluation.
 */

export interface Experiment {
  /** Unique experiment identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Variants with traffic allocation weights (must sum to 100) */
  variants: { id: string; weight: number }[];
}

/** Active experiments registry. */
export const EXPERIMENTS: Experiment[] = [
  {
    id: "quiz-cta-position",
    name: "Quiz CTA Button Position",
    variants: [
      { id: "control", weight: 50 },
      { id: "above-fold", weight: 50 },
    ],
  },
  {
    id: "homepage-hero-variant",
    name: "Homepage Hero Layout",
    variants: [
      { id: "default", weight: 70 },
      { id: "video-bg", weight: 30 },
    ],
  },
];

/**
 * Deterministic variant assignment based on user ID.
 * Uses a simple hash to bucket users consistently.
 */
export function assignVariant(experimentId: string, userId: string): string {
  const experiment = EXPERIMENTS.find((e) => e.id === experimentId);
  if (!experiment) return "control";

  const hash = simpleHash(`${experimentId}:${userId}`);
  const bucket = hash % 100;

  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (bucket < cumulative) return variant.id;
  }

  return experiment.variants[0].id;
}

/**
 * React hook-style getter for the current variant.
 * Reads user ID from localStorage or generates one.
 */
export function getVariant(experimentId: string): string {
  const userId = getOrCreateUserId();
  return assignVariant(experimentId, userId);
}

/** Track experiment exposure for analytics. */
export function trackExposure(experimentId: string, variantId: string): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "experiment_exposure", {
      experiment_id: experimentId,
      variant_id: variantId,
    });
  }
}

// ── Helpers ──

function getOrCreateUserId(): string {
  const key = "lumiere_ab_uid";
  let uid = localStorage.getItem(key);
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem(key, uid);
  }
  return uid;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
