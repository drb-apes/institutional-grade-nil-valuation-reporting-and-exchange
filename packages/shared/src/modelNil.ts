import type { AthleteProfile, AthleteTelemetry, DemandSignals } from './types.js';

/**
 * Core Model NIL calculation engine.
 * Combines performance, biometric, social, sponsor, and media factors.
 * Applies fatigue and risk penalties for a conservative intrinsic value.
 */
export function calculateModelNil(
  profile: AthleteProfile,
  telemetry: AthleteTelemetry,
  demand: DemandSignals,
): number {
  // Biometric component: readiness, explosiveness, HRV recovery
  const biometricComponent =
    telemetry.readiness * 0.22 +
    telemetry.explosiveOutput * 0.18 +
    Math.max(0, telemetry.heartRateVariability - 50) * 0.16;

  // Performance component: historical stats and consistency
  const performanceComponent = profile.performance * 18000;

  // Sponsorship fit: brand alignment and activation potential
  const sponsorshipComponent = profile.sponsorshipFit * 12000;

  // Social demand: follower growth, engagement, sentiment
  const socialComponent =
    demand.followerGrowth * 25000 +
    demand.engagementRate * 20000 +
    demand.marketSentiment * 15000;

  // Media velocity: impressions, content lift, PR value
  const mediaComponent = profile.mediaVelocity * 5000;

  // Sum all positive components
  const total =
    profile.baseValue +
    performanceComponent +
    sponsorshipComponent +
    biometricComponent * 120 +
    socialComponent +
    mediaComponent;

  // Apply penalties for fatigue, risk, volatility
  const penalty =
    telemetry.fatigue * 160 + // heavy fatigue = lower value
    profile.fatiguePenalty * 30000 + // coach signals fatigue window
    profile.riskDiscount * 25000 + // injury history or red flags
    profile.volatilityPenalty * 18000 + // off-field unpredictability
    Math.max(0, telemetry.latency - 120) * 50; // system responsiveness

  return Math.max(0, total - penalty);
}

/**
 * Market NIL: derive price from order book unit activity.
 * Reflects real-time demand and sentiment.
 */
export function calculateMarketNil(
  totalUnits: number,
  multiplier: number = 2.5,
): number {
  return Number((totalUnits * multiplier).toFixed(2));
}

/**
 * Divergence: Model NIL - Market NIL.
 * Positive divergence = undervalued (alpha opportunity).
 * Negative divergence = overvalued (risk-off).
 */
export function calculateDivergence(
  modelNil: number,
  marketNil: number,
): number {
  return Number((modelNil - marketNil).toFixed(2));
}

/**
 * Spread percentage: divergence as % of market price.
 */
export function calculateSpreadPercent(
  divergence: number,
  marketNil: number,
): number {
  return Number(((divergence / Math.max(1, marketNil)) * 100).toFixed(2));
}
