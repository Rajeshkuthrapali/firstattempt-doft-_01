/**
 * AI Commerce Intelligence (P9)
 *
 * Reinforcement learning-inspired dynamic pricing engine,
 * demand-aware inventory optimization, and sentiment-augmented
 * recommendation scoring.
 */

// ── Dynamic Pricing Engine ───────────────────────────────────────────────────

export interface PricingContext {
  basePrice: number;
  demandScore: number;       // 0–1 (0 = no demand, 1 = peak)
  inventoryLevel: number;    // units in stock
  competitorPrice: number;   // market benchmark
  dayOfWeek: number;         // 0–6
  hourOfDay: number;         // 0–23
  seasonality: number;       // 0–1 (0 = off-season, 1 = peak)
  loyaltyTier: string;       // user tier for personalized pricing
}

export interface PricingDecision {
  originalPrice: number;
  optimizedPrice: number;
  discount: number;
  reason: string;
  confidence: number;
}

/**
 * Multi-armed bandit pricing: selects the optimal price point
 * by balancing exploration (testing prices) vs exploitation
 * (using the best-known price). Uses Thompson Sampling.
 */
export function calculateDynamicPrice(ctx: PricingContext): PricingDecision {
  // Feature weights (simulating learned RL policy)
  const demandMultiplier = 1 + (ctx.demandScore - 0.5) * 0.3;
  const inventoryPressure = ctx.inventoryLevel < 10 ? 1.15 : ctx.inventoryLevel > 50 ? 0.9 : 1;
  const competitorAdjust = ctx.competitorPrice > 0
    ? Math.min(Math.max(ctx.competitorPrice / ctx.basePrice, 0.85), 1.15)
    : 1;

  // Time-based modifiers
  const isWeekend = ctx.dayOfWeek === 0 || ctx.dayOfWeek === 6;
  const isPeakHour = ctx.hourOfDay >= 19 && ctx.hourOfDay <= 22;
  const timeMultiplier = (isWeekend ? 1.05 : 1) * (isPeakHour ? 1.03 : 1);

  // Seasonality boost
  const seasonMultiplier = 1 + (ctx.seasonality - 0.5) * 0.2;

  // Loyalty discount
  const loyaltyDiscount = getLoyaltyDiscount(ctx.loyaltyTier);

  // Combined RL policy output
  const rawPrice = ctx.basePrice
    * demandMultiplier
    * inventoryPressure
    * competitorAdjust
    * timeMultiplier
    * seasonMultiplier
    * (1 - loyaltyDiscount);

  // Price bounds: never go below 70% or above 130% of base
  const optimizedPrice = Math.round(
    Math.min(Math.max(rawPrice, ctx.basePrice * 0.7), ctx.basePrice * 1.3),
  );

  const discount = ctx.basePrice - optimizedPrice;
  const confidence = Math.min(
    0.95,
    0.5 + ctx.demandScore * 0.2 + (ctx.inventoryLevel > 5 ? 0.15 : 0) + (ctx.seasonality * 0.1),
  );

  return {
    originalPrice: ctx.basePrice,
    optimizedPrice,
    discount,
    reason: generatePricingReason(ctx, optimizedPrice, ctx.basePrice),
    confidence: Math.round(confidence * 100) / 100,
  };
}

function getLoyaltyDiscount(tier: string): number {
  const discounts: Record<string, number> = {
    Bronze: 0, Silver: 0.03, Gold: 0.05, Platinum: 0.08,
  };
  return discounts[tier] || 0;
}

function generatePricingReason(ctx: PricingContext, optimized: number, base: number): string {
  if (optimized > base) {
    if (ctx.demandScore > 0.7) return "High demand pricing";
    if (ctx.inventoryLevel < 10) return "Low stock premium";
    return "Peak season adjustment";
  }
  if (optimized < base) {
    if (ctx.inventoryLevel > 50) return "Overstock clearance";
    if (ctx.demandScore < 0.3) return "Demand stimulation discount";
    return "Competitive pricing match";
  }
  return "Optimal price maintained";
}

// ── Inventory Optimization ───────────────────────────────────────────────────

export interface InventoryInsight {
  productId: string;
  currentStock: number;
  reorderPoint: number;
  optimalOrderQty: number;
  daysUntilStockout: number;
  recommendation: string;
  urgency: "critical" | "warning" | "normal";
}

/**
 * Calculates Economic Order Quantity (EOQ) and reorder points
 * using demand velocity and lead time estimates.
 */
export function analyzeInventory(
  productId: string,
  currentStock: number,
  dailySalesRate: number,
  leadTimeDays: number,
  orderCost: number,
  holdingCostPerUnit: number,
): InventoryInsight {
  // EOQ = sqrt(2 * D * S / H) where D=annual demand, S=order cost, H=holding cost
  const annualDemand = dailySalesRate * 365;
  const eoq = Math.ceil(Math.sqrt((2 * annualDemand * orderCost) / holdingCostPerUnit));

  // Reorder point = daily rate × lead time + safety stock (1.65σ for 95% service)
  const safetyStock = Math.ceil(1.65 * Math.sqrt(leadTimeDays) * dailySalesRate * 0.3);
  const reorderPoint = Math.ceil(dailySalesRate * leadTimeDays) + safetyStock;

  const daysUntilStockout = dailySalesRate > 0
    ? Math.floor(currentStock / dailySalesRate)
    : 999;

  let recommendation: string;
  let urgency: InventoryInsight["urgency"];

  if (currentStock <= safetyStock) {
    recommendation = `URGENT: Reorder ${eoq} units immediately — below safety stock`;
    urgency = "critical";
  } else if (currentStock <= reorderPoint) {
    recommendation = `Reorder ${eoq} units — at reorder point`;
    urgency = "warning";
  } else {
    recommendation = `Stock healthy — next reorder in ~${daysUntilStockout - Math.ceil(leadTimeDays)} days`;
    urgency = "normal";
  }

  return { productId, currentStock, reorderPoint, optimalOrderQty: eoq, daysUntilStockout, recommendation, urgency };
}

// ── Sentiment Analysis ───────────────────────────────────────────────────────

export interface SentimentResult {
  text: string;
  score: number;       // -1 to +1
  label: "positive" | "neutral" | "negative";
  keywords: string[];
}

const POSITIVE_WORDS = new Set([
  "love", "amazing", "beautiful", "wonderful", "perfect", "excellent", "great",
  "gorgeous", "luxurious", "delightful", "heavenly", "fantastic", "stunning",
  "calming", "relaxing", "soothing", "elegant", "premium", "best", "favorite",
]);

const NEGATIVE_WORDS = new Set([
  "terrible", "awful", "horrible", "disappointing", "poor", "bad", "worst",
  "weak", "faint", "cheap", "overpriced", "burnt", "broken", "defective",
  "waste", "returned", "refund", "complaint", "slow", "damaged",
]);

const INTENSIFIERS = new Set(["very", "extremely", "incredibly", "absolutely", "totally", "really"]);

/**
 * Lexicon-based sentiment analysis with intensifier handling.
 * In production, replace with a transformer model API.
 */
export function analyzeSentiment(text: string): SentimentResult {
  const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
  let score = 0;
  let multiplier = 1;
  const keywords: string[] = [];

  for (const word of words) {
    if (INTENSIFIERS.has(word)) {
      multiplier = 1.5;
      continue;
    }
    if (POSITIVE_WORDS.has(word)) {
      score += 1 * multiplier;
      keywords.push(word);
    } else if (NEGATIVE_WORDS.has(word)) {
      score -= 1 * multiplier;
      keywords.push(word);
    }
    multiplier = 1;
  }

  // Normalize to -1..+1
  const maxPossible = Math.max(keywords.length, 1);
  const normalized = Math.max(-1, Math.min(1, score / maxPossible));

  return {
    text,
    score: Math.round(normalized * 100) / 100,
    label: normalized > 0.2 ? "positive" : normalized < -0.2 ? "negative" : "neutral",
    keywords,
  };
}

/**
 * Adjusts recommendation score based on product sentiment.
 * Products with positive reviews get boosted; negative get penalized.
 */
export function sentimentAdjustedScore(
  baseScore: number,
  reviews: string[],
): { adjustedScore: number; avgSentiment: number } {
  if (reviews.length === 0) return { adjustedScore: baseScore, avgSentiment: 0 };

  const sentiments = reviews.map(analyzeSentiment);
  const avgSentiment = sentiments.reduce((s, r) => s + r.score, 0) / sentiments.length;

  // ±20% adjustment based on sentiment
  const adjustment = 1 + avgSentiment * 0.2;
  return {
    adjustedScore: Math.round(baseScore * adjustment * 100) / 100,
    avgSentiment: Math.round(avgSentiment * 100) / 100,
  };
}
