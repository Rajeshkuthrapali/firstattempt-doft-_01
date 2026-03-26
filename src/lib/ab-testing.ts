/**
 * A/B Testing Framework v2 (P5)
 *
 * Enhanced with:
 * - Server-side assignment via edge middleware simulation
 * - Multi-variant support (3+ variants)
 * - Conversion tracking with funnel attribution
 * - Experiment lifecycle management
 */

export type VariantId = string;

export interface Variant {
  id: VariantId;
  /** Traffic allocation weight (all weights in experiment must sum to 100) */
  weight: number;
  /** Human-readable label */
  label: string;
}

export type ExperimentStatus = "draft" | "running" | "paused" | "completed";

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  variants: Variant[];
  /** Metric to optimize (e.g. "purchase", "quiz_completed") */
  goalEvent: string;
  /** Start timestamp */
  startedAt?: string;
  /** End timestamp */
  endedAt?: string;
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  exposures: number;
  conversions: number;
  conversionRate: number;
}

// ── Experiment Registry ──────────────────────────────────────────────────────

export const EXPERIMENTS: Experiment[] = [
  {
    id: "quiz-cta-position",
    name: "Quiz CTA Button Position",
    description: "Test whether placing the Scent Match CTA above the fold increases quiz completions.",
    status: "running",
    variants: [
      { id: "control", weight: 50, label: "Below Hero" },
      { id: "above-fold", weight: 50, label: "Above Fold" },
    ],
    goalEvent: "scent_match_completed",
    startedAt: "2026-03-26T00:00:00Z",
  },
  {
    id: "homepage-hero-variant",
    name: "Homepage Hero Layout",
    description: "Test video background vs static image vs animated gradient hero.",
    status: "running",
    variants: [
      { id: "static-image", weight: 40, label: "Static Image" },
      { id: "video-bg", weight: 30, label: "Video Background" },
      { id: "gradient-anim", weight: 30, label: "Animated Gradient" },
    ],
    goalEvent: "add_to_cart",
    startedAt: "2026-03-26T00:00:00Z",
  },
  {
    id: "checkout-upsell",
    name: "Checkout Upsell Strategy",
    description: "Compare upsell placement and messaging at checkout.",
    status: "draft",
    variants: [
      { id: "none", weight: 34, label: "No Upsell" },
      { id: "sidebar", weight: 33, label: "Sidebar Recommendation" },
      { id: "modal", weight: 33, label: "Modal After Add" },
    ],
    goalEvent: "purchase",
  },
];

// ── Mock Results (simulated analytics data) ──────────────────────────────────

export const MOCK_RESULTS: ExperimentResult[] = [
  { experimentId: "quiz-cta-position", variantId: "control", exposures: 1240, conversions: 186, conversionRate: 15.0 },
  { experimentId: "quiz-cta-position", variantId: "above-fold", exposures: 1260, conversions: 252, conversionRate: 20.0 },
  { experimentId: "homepage-hero-variant", variantId: "static-image", exposures: 2100, conversions: 168, conversionRate: 8.0 },
  { experimentId: "homepage-hero-variant", variantId: "video-bg", exposures: 1580, conversions: 158, conversionRate: 10.0 },
  { experimentId: "homepage-hero-variant", variantId: "gradient-anim", exposures: 1520, conversions: 137, conversionRate: 9.0 },
];

// ── Assignment Engine ────────────────────────────────────────────────────────

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Server-side style assignment — deterministic, stateless.
 * Could be deployed to an edge function for true SSR assignment.
 */
export function assignVariant(experimentId: string, userId: string): VariantId {
  const experiment = EXPERIMENTS.find((e) => e.id === experimentId);
  if (!experiment || experiment.status !== "running") return "control";

  const bucket = simpleHash(`${experimentId}:${userId}`) % 100;
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (bucket < cumulative) return variant.id;
  }
  return experiment.variants[0].id;
}

/** Reads or creates a persistent anonymous user ID. */
export function getOrCreateUserId(): string {
  const key = "lumiere_ab_uid";
  let uid = localStorage.getItem(key);
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem(key, uid);
  }
  return uid;
}

/** Convenience: get variant for current user. */
export function getVariant(experimentId: string): VariantId {
  return assignVariant(experimentId, getOrCreateUserId());
}

// ── Analytics ────────────────────────────────────────────────────────────────

/** Track that a user was exposed to a variant. */
export function trackExposure(experimentId: string, variantId: string): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "experiment_exposure", {
      experiment_id: experimentId,
      variant_id: variantId,
    });
  }
}

/** Track a conversion event attributed to an experiment. */
export function trackConversion(experimentId: string, variantId: string): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "experiment_conversion", {
      experiment_id: experimentId,
      variant_id: variantId,
    });
  }
}
