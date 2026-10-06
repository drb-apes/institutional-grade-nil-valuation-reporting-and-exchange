export interface ModelNilInputs {
  baseValue: number;
  performance: number;
  sponsorshipFit: number;
  mediaVelocity: number;
  socialDemand: number;
  biometricStability: number;
  fatiguePenalty: number;
  riskDiscount: number;
  volatilityPenalty: number;
}

export interface TelemetryInputs {
  heartRateVariability: number;
  readiness: number;
  explosiveOutput: number;
  fatigue: number;
  recovery: number;
  engagementVelocity: number;
  latency: number;
}

export interface MarketSignals {
  followerGrowth: number;
  engagementRate: number;
  sponsorInterest: number;
  marketSentiment: number;
}

export interface RiskStateInputs {
  latency: number;
  dwellTime: number;
  engagementVelocity: number;
  spendShock: number;
  athleteOutputShock: number;
}

export function calculateModelNil(
  athlete: ModelNilInputs,
  telemetry: TelemetryInputs,
  market: MarketSignals,
): number {
  const value =
    athlete.baseValue *
    (0.55 + athlete.performance * 0.25) *
    (1 + athlete.sponsorshipFit * 0.2) *
    (1 + athlete.mediaVelocity * 0.12) *
    (1 + athlete.socialDemand * 0.18) *
    (1 + telemetry.readiness / 100 * 0.14) *
    (1 + telemetry.explosiveOutput / 100 * 0.12) *
    (1 + market.followerGrowth * 0.25) *
    (1 + market.engagementRate * 0.18) *
    (1 + market.sponsorInterest * 0.2) *
    (1 - athlete.fatiguePenalty * 0.35) *
    (1 - athlete.riskDiscount * 0.4) *
    (1 - athlete.volatilityPenalty * 0.25) *
    (1 - Math.max(0, telemetry.fatigue - 30) / 100 * 0.4);

  return Number(value.toFixed(2));
}

export function calculateMarketNil(spot: number, volatility: number): number {
  return Number((spot * (1 + volatility / 100)).toFixed(2));
}

export function calculateDivergence(modelNil: number, marketNil: number): number {
  return Number((modelNil - marketNil).toFixed(2));
}

export function evaluateRiskState(state: RiskStateInputs): 'CRS-0' | 'CRS-1' | 'CRS-2' | 'CRS-3' {
  const composite =
    state.latency / 200 +
    (1 - state.dwellTime) * 0.8 +
    Math.max(0, 1.5 - state.engagementVelocity) * 0.7 +
    state.spendShock * 1.3 +
    state.athleteOutputShock * 1.5;

  if (composite >= 2.4) return 'CRS-3';
  if (composite >= 1.7) return 'CRS-2';
  if (composite >= 1.1) return 'CRS-1';
  return 'CRS-0';
}

export function determineCrs(level: ReturnType<typeof evaluateRiskState>): string {
  return level;
}
