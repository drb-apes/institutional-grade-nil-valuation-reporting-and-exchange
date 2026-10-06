export type CrisisState = 'CRS-0' | 'CRS-1' | 'CRS-2' | 'CRS-3';

export interface AthleteProfile {
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

export interface AthleteTelemetry {
  heartRateVariability: number;
  readiness: number;
  explosiveOutput: number;
  fatigue: number;
  recovery: number;
  engagementVelocity: number;
  latency: number;
}

export interface DemandSignals {
  followerGrowth: number;
  engagementRate: number;
  sponsorInterest: number;
  marketSentiment: number;
}

export function calculateModelNil(
  profile: AthleteProfile,
  telemetry: AthleteTelemetry,
  demand: DemandSignals,
): number {
  const biometricComponent = telemetry.readiness * 0.22 + telemetry.explosiveOutput * 0.18 + telemetry.heartRateVariability * 0.16;
  const performanceComponent = profile.performance * 18000;
  const sponsorshipComponent = profile.sponsorshipFit * 12000;
  const socialComponent = demand.followerGrowth * 25000 + demand.engagementRate * 20000 + demand.marketSentiment * 15000;
  const mediaComponent = profile.mediaVelocity * 5000;

  const total =
    profile.baseValue +
    performanceComponent +
    sponsorshipComponent +
    biometricComponent * 120 +
    socialComponent +
    mediaComponent;

  const penalty =
    telemetry.fatigue * 160 +
    profile.fatiguePenalty * 30000 +
    profile.riskDiscount * 25000 +
    profile.volatilityPenalty * 18000 +
    Math.max(0, telemetry.latency - 120) * 50;

  return Math.max(0, total - penalty);
}

export function calculateMarketNil(totalUnits: number, multiplier = 2.5): number {
  return Number((totalUnits * multiplier).toFixed(2));
}

export function calculateDivergence(modelNil: number, marketNil: number): number {
  return Number((modelNil - marketNil).toFixed(2));
}

export interface RiskInputs {
  latency: number;
  dwellTime: number;
  engagementVelocity: number;
  spendShock: number;
  athleteOutputShock: number;
}

export function evaluateRiskState({ latency, dwellTime, engagementVelocity, spendShock, athleteOutputShock }: RiskInputs): number {
  const normalizedLatency = Math.max(0, (latency - 100) / 200);
  const normalizedDwell = Math.max(0, (0.6 - dwellTime) / 0.6);
  const normalizedVelocity = Math.max(0, (1.6 - engagementVelocity) / 1.6);
  const normalizedSpendShock = Math.max(0, spendShock);
  const normalizedAthleteShock = Math.max(0, athleteOutputShock);

  return Number(
    (
      0.3 * normalizedLatency +
      0.25 * normalizedDwell +
      0.2 * normalizedVelocity +
      0.15 * normalizedSpendShock +
      0.1 * normalizedAthleteShock
    ).toFixed(4),
  );
}

export function determineCrs(score: number): CrisisState {
  if (score >= 1.3) return 'CRS-3';
  if (score >= 0.9) return 'CRS-2';
  if (score >= 0.55) return 'CRS-1';
  return 'CRS-0';
}
