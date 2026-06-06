/**
 * Advanced Analytics: LTV & Fraud Detection (P9)
 *
 * Predictive lifetime value modeling and anomaly detection
 * for fraud prevention and unusual purchase patterns.
 */

// ── Predictive LTV Model ─────────────────────────────────────────────────────

export interface CustomerLTVInput {
  customerId: string;
  totalOrders: number;
  totalRevenue: number;
  daysSinceFirstOrder: number;
  avgOrderFrequencyDays: number;
  loyaltyTier: string;
  returnRate: number;           // 0–1
  emailEngagement: number;      // 0–1
  referralCount: number;
}

export interface LTVPrediction {
  customerId: string;
  currentLTV: number;
  predictedLTV12m: number;
  predictedLTV24m: number;
  segment: "champion" | "loyal" | "potential" | "at-risk" | "dormant";
  growthPotential: number;
  recommendations: string[];
}

/**
 * BG/NBD-inspired LTV prediction using purchase frequency,
 * recency, monetary value, and engagement signals.
 */
export function predictLTV(input: CustomerLTVInput): LTVPrediction {
  const monthsActive = Math.max(input.daysSinceFirstOrder / 30, 1);
  const monthlyFrequency = input.totalOrders / monthsActive;
  const avgOrderValue = input.totalOrders > 0 ? input.totalRevenue / input.totalOrders : 0;

  // Tier multipliers
  const tierMultiplier: Record<string, number> = {
    Bronze: 1, Silver: 1.15, Gold: 1.35, Platinum: 1.6,
  };
  const tm = tierMultiplier[input.loyaltyTier] || 1;

  // Base projected monthly spend
  const baseMonthlySpend = monthlyFrequency * avgOrderValue * tm;

  // Engagement boosters
  const engagementBoost = 1 + (input.emailEngagement * 0.15) + (input.referralCount * 0.05);

  // Return penalty
  const returnPenalty = 1 - (input.returnRate * 0.3);

  // Churn decay factor (higher frequency = lower decay)
  const churnDecay12 = Math.pow(0.95, 12 / Math.max(input.avgOrderFrequencyDays / 30, 0.5));
  const churnDecay24 = Math.pow(0.93, 24 / Math.max(input.avgOrderFrequencyDays / 30, 0.5));

  const predicted12m = Math.round(baseMonthlySpend * 12 * engagementBoost * returnPenalty * churnDecay12);
  const predicted24m = Math.round(baseMonthlySpend * 24 * engagementBoost * returnPenalty * churnDecay24);

  const segment = classifySegment(monthlyFrequency, input.daysSinceFirstOrder, input.totalRevenue);
  const growthPotential = Math.round(((predicted12m / Math.max(input.totalRevenue, 1)) - 1) * 100);

  return {
    customerId: input.customerId,
    currentLTV: input.totalRevenue,
    predictedLTV12m: predicted12m,
    predictedLTV24m: predicted24m,
    segment,
    growthPotential: Math.max(0, growthPotential),
    recommendations: getLTVRecommendations(segment, input),
  };
}

function classifySegment(
  freq: number, tenure: number, revenue: number,
): LTVPrediction["segment"] {
  if (freq >= 2 && revenue > 10000) return "champion";
  if (freq >= 1 && revenue > 5000) return "loyal";
  if (tenure < 90 && freq > 0) return "potential";
  if (tenure > 60 && freq < 0.5) return "at-risk";
  return "dormant";
}

function getLTVRecommendations(
  segment: LTVPrediction["segment"], input: CustomerLTVInput,
): string[] {
  const recs: string[] = [];
  switch (segment) {
    case "champion":
      recs.push("Offer exclusive early access to new collections");
      recs.push("Invite to referral program with bonus points");
      break;
    case "loyal":
      recs.push("Highlight tier upgrade benefits");
      if (input.emailEngagement < 0.5) recs.push("Re-engage with personalized email series");
      break;
    case "potential":
      recs.push("Send second-purchase incentive (10% off)");
      recs.push("Invite to scent-match quiz for personalization");
      break;
    case "at-risk":
      recs.push("Trigger win-back campaign with free shipping");
      recs.push("Offer loyalty points expiry reminder");
      break;
    case "dormant":
      recs.push("Send re-activation email with new products");
      recs.push("Offer return customer discount (20% off)");
      break;
  }
  return recs;
}

// ── Anomaly / Fraud Detection ────────────────────────────────────────────────

export interface TransactionSignals {
  transactionId: string;
  amount: number;
  currency: string;
  customerId: string;
  ipAddress: string;
  userAgent: string;
  shippingCountry: string;
  billingCountry: string;
  cardBin: string;
  velocityLast1h: number;     // # transactions by same customer in last hour
  velocityLast24h: number;
  avgOrderValue: number;      // customer's historical average
  isNewCustomer: boolean;
  isNewDevice: boolean;
}

export interface FraudAssessment {
  transactionId: string;
  riskScore: number;           // 0–100
  riskLevel: "low" | "medium" | "high" | "block";
  flags: string[];
  action: "approve" | "review" | "challenge" | "block";
}

/**
 * Rule-based + statistical anomaly detection for fraud prevention.
 * In production, combine with ML model from historical fraud labels.
 */
export function assessFraudRisk(signals: TransactionSignals): FraudAssessment {
  let riskScore = 0;
  const flags: string[] = [];

  // Amount anomaly (> 3x historical average)
  if (signals.avgOrderValue > 0 && signals.amount > signals.avgOrderValue * 3) {
    riskScore += 25;
    flags.push(`Amount ${(signals.amount / signals.avgOrderValue).toFixed(1)}x above average`);
  }

  // Velocity check
  if (signals.velocityLast1h > 3) {
    riskScore += 30;
    flags.push(`${signals.velocityLast1h} transactions in last hour`);
  } else if (signals.velocityLast24h > 10) {
    riskScore += 15;
    flags.push(`${signals.velocityLast24h} transactions in last 24h`);
  }

  // Country mismatch
  if (signals.shippingCountry !== signals.billingCountry) {
    riskScore += 20;
    flags.push(`Ship/bill country mismatch: ${signals.shippingCountry} vs ${signals.billingCountry}`);
  }

  // New customer + high value
  if (signals.isNewCustomer && signals.amount > 5000) {
    riskScore += 15;
    flags.push("New customer with high-value order");
  }

  // New device
  if (signals.isNewDevice) {
    riskScore += 10;
    flags.push("New device detected");
  }

  // High-risk BIN ranges (simplified)
  const highRiskBins = ["4111", "5500", "3400"];
  if (highRiskBins.includes(signals.cardBin.slice(0, 4))) {
    riskScore += 10;
    flags.push("High-risk card BIN");
  }

  riskScore = Math.min(100, riskScore);
  const riskLevel = getRiskLevel(riskScore);
  const action = getAction(riskLevel);

  return { transactionId: signals.transactionId, riskScore, riskLevel, flags, action };
}

function getRiskLevel(score: number): FraudAssessment["riskLevel"] {
  if (score >= 80) return "block";
  if (score >= 55) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function getAction(level: FraudAssessment["riskLevel"]): FraudAssessment["action"] {
  switch (level) {
    case "block": return "block";
    case "high": return "challenge";
    case "medium": return "review";
    default: return "approve";
  }
}
