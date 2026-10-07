export type CrisisState = 'CRS-0' | 'CRS-1' | 'CRS-2' | 'CRS-3';

export interface AthleteProfile {
  id: string;
  name: string;
  team: string;
  position: string;
  baseValue: number;
  performance: number;
  sponsorshipFit: number;
  mediaVelocity: number;
  socialDemand: number;
  biometricStability: number;
  fatiguePenalty: number;
  riskDiscount: number;
  volatilityPenalty: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AthleteTelemetry {
  athleteId: string;
  heartRateVariability: number;
  readiness: number;
  explosiveOutput: number;
  fatigue: number;
  recovery: number;
  engagementVelocity: number;
  latency: number;
  timestamp: Date;
}

export interface DemandSignals {
  followerGrowth: number;
  engagementRate: number;
  sponsorInterest: number;
  marketSentiment: number;
}

export interface RiskInputs {
  latency: number;
  dwellTime: number;
  engagementVelocity: number;
  spendShock: number;
  athleteOutputShock: number;
}

export interface MarketQuote {
  athleteId: string;
  modelNil: number;
  marketNil: number;
  divergence: number;
  spreadPercent: number;
  bid: number;
  ask: number;
  volume24h: number;
  timestamp: Date;
}

export interface Order {
  id: string;
  userId: string;
  athleteId: string;
  side: 'buy' | 'sell';
  quantity: number;
  pricePerUnit: number;
  status: 'pending' | 'filled' | 'partial' | 'cancelled';
  filledQuantity: number;
  executedPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  sponsorId: string;
  sponsorName: string;
  principal: number;
  revenueSweepPercent: number;
  riskProfile: CrisisState;
  activeTranches: number;
  capitalSecured: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tranche {
  id: string;
  campaignId: string;
  className: 'senior' | 'mezzanine' | 'junior';
  apy: number;
  principal: number;
  riskBand: CrisisState;
  unitsOutstanding: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  userId: string;
  trancheId: string;
  units: number;
  costBasis: number;
  currentValue: number;
  accruedYield: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HedgeEvent {
  id: string;
  campaignId: string;
  riskLevel: CrisisState;
  trigger: string;
  action: string;
  timestamp: Date;
  completedAt?: Date;
}

export interface NormalizedMetric {
  source: string;
  sourceDevice: string;
  athleteId: string;
  type: string;
  value: number;
  unit: string;
  timestamp: Date;
  qualityScore: number;
  metadata: Record<string, unknown>;
}
