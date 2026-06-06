/**
 * Predictive Analytics Module (P8)
 *
 * Churn prediction using a logistic regression-style scorer,
 * and cohort drill-down utilities for geography/device segmentation.
 */

// ── Churn Prediction ─────────────────────────────────────────────────────────

export interface ChurnFeatures {
  daysSinceLastPurchase: number;
  totalOrders: number;
  avgOrderValue: number;
  loyaltyPoints: number;
  sessionCount30d: number;
  emailEngagementRate: number;
  supportTickets: number;
}

export interface ChurnPrediction {
  userId: string;
  probability: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  topFactors: string[];
  suggestedAction: string;
}

/** Feature weights (simulating a trained logistic regression model). */
const WEIGHTS: Record<keyof ChurnFeatures, number> = {
  daysSinceLastPurchase: 0.35,
  totalOrders: -0.20,
  avgOrderValue: -0.10,
  loyaltyPoints: -0.15,
  sessionCount30d: -0.25,
  emailEngagementRate: -0.20,
  supportTickets: 0.15,
};

const INTERCEPT = 0.3;

/**
 * Predicts churn probability using weighted feature scoring.
 * Returns a 0–1 probability and risk classification.
 */
export function predictChurn(userId: string, features: ChurnFeatures): ChurnPrediction {
  // Normalize features to 0–1 scale
  const normalized: Record<keyof ChurnFeatures, number> = {
    daysSinceLastPurchase: Math.min(features.daysSinceLastPurchase / 180, 1),
    totalOrders: Math.min(features.totalOrders / 20, 1),
    avgOrderValue: Math.min(features.avgOrderValue / 5000, 1),
    loyaltyPoints: Math.min(features.loyaltyPoints / 5000, 1),
    sessionCount30d: Math.min(features.sessionCount30d / 30, 1),
    emailEngagementRate: features.emailEngagementRate,
    supportTickets: Math.min(features.supportTickets / 5, 1),
  };

  // Compute logit score
  let logit = INTERCEPT;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    logit += weight * normalized[key as keyof ChurnFeatures];
  }

  // Sigmoid activation
  const probability = 1 / (1 + Math.exp(-logit * 5));

  // Identify top contributing factors
  const factorScores = Object.entries(WEIGHTS)
    .map(([key, weight]) => ({
      key,
      contribution: Math.abs(weight * normalized[key as keyof ChurnFeatures]),
      direction: weight > 0 ? "risk" : "protection",
    }))
    .sort((a, b) => b.contribution - a.contribution);

  const topFactors = factorScores
    .slice(0, 3)
    .map((f) => formatFactor(f.key, f.direction as "risk" | "protection"));

  const riskLevel = getRiskLevel(probability);
  const suggestedAction = getSuggestedAction(riskLevel, factorScores[0].key);

  return { userId, probability: Math.round(probability * 100) / 100, riskLevel, topFactors, suggestedAction };
}

function getRiskLevel(prob: number): ChurnPrediction["riskLevel"] {
  if (prob >= 0.8) return "critical";
  if (prob >= 0.6) return "high";
  if (prob >= 0.35) return "medium";
  return "low";
}

function formatFactor(key: string, direction: "risk" | "protection"): string {
  const labels: Record<string, string> = {
    daysSinceLastPurchase: "Days since last purchase",
    totalOrders: "Total order history",
    avgOrderValue: "Average order value",
    loyaltyPoints: "Loyalty engagement",
    sessionCount30d: "Recent site activity",
    emailEngagementRate: "Email engagement",
    supportTickets: "Support interactions",
  };
  return `${direction === "risk" ? "⚠️" : "✅"} ${labels[key] || key}`;
}

function getSuggestedAction(risk: ChurnPrediction["riskLevel"], topFactor: string): string {
  const actions: Record<string, Record<string, string>> = {
    critical: {
      daysSinceLastPurchase: "Send exclusive win-back offer with 30% discount",
      sessionCount30d: "Trigger re-engagement email with new arrivals",
      default: "Assign to customer success for personal outreach",
    },
    high: {
      daysSinceLastPurchase: "Send personalized product recommendations",
      loyaltyPoints: "Highlight expiring loyalty points",
      default: "Include in targeted retention campaign",
    },
    medium: {
      default: "Add to nurture email sequence",
    },
    low: {
      default: "Continue standard engagement",
    },
  };
  return actions[risk]?.[topFactor] || actions[risk]?.default || "Monitor engagement";
}

// ── Cohort Drill-Down ────────────────────────────────────────────────────────

export type DrillDimension = "geography" | "device" | "acquisition" | "tier";

export interface CohortSegment {
  dimension: DrillDimension;
  value: string;
  size: number;
  retention: number[];
  avgRevenue: number;
  churnRate: number;
}

export const GEOGRAPHY_SEGMENTS: CohortSegment[] = [
  { dimension: "geography", value: "India (North)", size: 820, retention: [100, 64, 50, 39], avgRevenue: 2800, churnRate: 22 },
  { dimension: "geography", value: "India (South)", size: 680, retention: [100, 60, 47, 36], avgRevenue: 3200, churnRate: 25 },
  { dimension: "geography", value: "India (West)", size: 540, retention: [100, 58, 44, 33], avgRevenue: 3100, churnRate: 28 },
  { dimension: "geography", value: "USA", size: 320, retention: [100, 55, 40, 30], avgRevenue: 4500, churnRate: 30 },
  { dimension: "geography", value: "UK", size: 210, retention: [100, 62, 48, 38], avgRevenue: 4200, churnRate: 24 },
  { dimension: "geography", value: "UAE", size: 180, retention: [100, 66, 52, 42], avgRevenue: 5100, churnRate: 20 },
];

export const DEVICE_SEGMENTS: CohortSegment[] = [
  { dimension: "device", value: "Mobile (iOS)", size: 1200, retention: [100, 62, 48, 37], avgRevenue: 3400, churnRate: 24 },
  { dimension: "device", value: "Mobile (Android)", size: 980, retention: [100, 56, 42, 32], avgRevenue: 2800, churnRate: 29 },
  { dimension: "device", value: "Desktop", size: 520, retention: [100, 65, 52, 42], avgRevenue: 4100, churnRate: 21 },
  { dimension: "device", value: "Tablet", size: 150, retention: [100, 60, 46, 35], avgRevenue: 3600, churnRate: 26 },
];

/** Returns cohort segments for the requested drill-down dimension. */
export function getCohortDrillDown(dimension: DrillDimension): CohortSegment[] {
  switch (dimension) {
    case "geography": return GEOGRAPHY_SEGMENTS;
    case "device": return DEVICE_SEGMENTS;
    default: return GEOGRAPHY_SEGMENTS;
  }
}
