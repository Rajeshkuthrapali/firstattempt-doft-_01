/**
 * Autonomous Commerce AI (P10)
 * RL agent for autonomous discounting + demand forecasting.
 */

export interface AgentState {
  productId: string;
  currentPrice: number;
  inventoryLevel: number;
  demandForecast: number;
  competitorIndex: number;
  conversionRate: number;
  stockoutRisk: number;
  promotionBudgetRemaining: number;
}

export interface AgentAction {
  discountPct: number;
  promoteInEmail: boolean;
  promoteInApp: boolean;
  scheduledFor: string;
  reason: string;
  confidenceScore: number;
}

const ACTION_SPACE = [0, 5, 10, 15, 20, 25, 30];

/** Epsilon-greedy RL pricing agent (ε=0.05 in production). */
export function runPricingAgent(state: AgentState, epsilon = 0.05): AgentAction {
  const qValues = ACTION_SPACE.map((discount) => computeQValue(state, discount));
  const bestIdx = qValues.indexOf(Math.max(...qValues));
  const explore = Math.random() < epsilon;
  const chosenIdx = explore ? Math.floor(Math.random() * ACTION_SPACE.length) : bestIdx;
  const discountPct = ACTION_SPACE[chosenIdx];
  const promoteInEmail = discountPct >= 15 && state.promotionBudgetRemaining > 5000;
  const promoteInApp = discountPct >= 10 && state.inventoryLevel > 20;
  const scheduledFor = state.stockoutRisk < 0.3
    ? new Date().toISOString()
    : getNextMorning().toISOString();
  const confidence = Math.round((1 - epsilon) * (qValues[chosenIdx] / Math.max(...qValues)) * 100) / 100;
  return { discountPct, promoteInEmail, promoteInApp, scheduledFor, reason: generateAgentReason(state, discountPct), confidenceScore: confidence };
}

function computeQValue(state: AgentState, discountPct: number): number {
  const priceFactor = 1 - discountPct / 100;
  const demandLift = discountPct > 0 ? 1 + (discountPct / 100) * 2.5 * (1 - state.competitorIndex) : 1;
  const revenueLift = state.demandForecast * demandLift * state.currentPrice * priceFactor;
  const stockoutPenalty = state.stockoutRisk * discountPct * 1000;
  const inventoryBonus = state.inventoryLevel > 30 ? discountPct * 200 : 0;
  return revenueLift - stockoutPenalty + inventoryBonus;
}

function generateAgentReason(state: AgentState, discount: number): string {
  if (state.stockoutRisk > 0.7) return "Low stock — minimal discount to preserve margin";
  if (state.competitorIndex > 0.7) return "Competitor undercut — aggressive discount to recapture demand";
  if (state.demandForecast < 5 && state.inventoryLevel > 30) return "Low demand + high stock — clearance discount";
  if (discount === 0) return "Optimal price — no discount needed";
  return `${discount}% discount maximizes 7-day revenue given current market state`;
}

function getNextMorning(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

// ── Demand Forecasting ───────────────────────────────────────────────────────

export interface DemandSignal {
  historicalAvgDailySales: number;
  dayOfWeek: number;
  isHoliday: boolean;
  holidayMultiplier: number;
  seasonalIndex: number;
  macroIndex: number;
  weatherScore: number;
  socialMentions7d: number;
  emailCampaignActive: boolean;
}

export interface DemandForecast {
  expectedDailySales: number;
  expectedWeeklySales: number;
  confidenceInterval: [number, number];
  drivers: string[];
  recommendedStockLevel: number;
}

const DOW_MULTIPLIERS = [0.8, 0.9, 1.0, 1.0, 1.1, 1.4, 1.3];

/** Multiplicative decomposition demand forecast with 7 external signals. */
export function forecastDemand(signal: DemandSignal): DemandForecast {
  const base = signal.historicalAvgDailySales;
  const drivers: string[] = [];
  const seasonal = 1 + (signal.seasonalIndex - 0.5) * 0.6;
  if (signal.seasonalIndex > 0.7) drivers.push("Peak season");
  const holiday = signal.isHoliday ? signal.holidayMultiplier : 1;
  if (signal.isHoliday) drivers.push(`Holiday surge (${signal.holidayMultiplier}x)`);
  const dow = DOW_MULTIPLIERS[signal.dayOfWeek];
  if (dow >= 1.3) drivers.push("Weekend peak");
  const macro = 0.7 + signal.macroIndex * 0.6;
  if (signal.macroIndex < 0.3) drivers.push("Macro headwinds");
  const weather = 1 + (1 - signal.weatherScore) * 0.3;
  if (signal.weatherScore < 0.3) drivers.push("Cold/rainy weather boost");
  const social = 1 + (signal.socialMentions7d / 1000) * 0.2;
  if (signal.socialMentions7d > 500) drivers.push("High social buzz");
  const campaign = signal.emailCampaignActive ? 1.25 : 1;
  if (signal.emailCampaignActive) drivers.push("Active email campaign");
  const expectedDailySales = Math.round(base * seasonal * holiday * dow * macro * weather * social * campaign);
  const expectedWeeklySales = expectedDailySales * 7;
  const ci: [number, number] = [Math.round(expectedWeeklySales * 0.8), Math.round(expectedWeeklySales * 1.2)];
  return { expectedDailySales, expectedWeeklySales, confidenceInterval: ci, drivers, recommendedStockLevel: Math.ceil(expectedDailySales * 14 * 1.3) };
}
