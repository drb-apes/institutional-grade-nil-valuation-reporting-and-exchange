// Athlete and NIL Contract Schema
export interface Athlete {
  id: string;
  name: string;
  sport: string;
  collegeId?: string;
  leagueId?: string;
  biometricProfileId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NILContract {
  id: string;
  athleteId: string;
  modelNIL: number; // Intrinsic value from BLEI-E
  marketNIL: number; // Current trading price
  lastUpdated: Date;
  status: 'active' | 'closed' | 'pending';
}

export interface BiometricProfile {
  id: string;
  athleteId: string;
  explosiveOutputMultiplier: number; // EOM
  playerFatigueIndex: number; // PFI
  recoveryScore: number;
  lastSyncedAt: Date;
  source: 'wearable' | 'broadcast_feed' | 'api';
}

// Sponsor and Yield Tranche Schema
export interface Sponsor {
  id: string;
  name: string;
  totalAllocation: number; // Campaign budget
  marginPoolPercentage: number; // % swept to margin (typically 10%)
  status: 'active' | 'pending' | 'concluded';
  createdAt: Date;
}

export interface YieldTranche {
  id: string;
  sponsorId: string;
  campaignName: string;
  totalUnits: number;
  unitPrice: number;
  currentAPY: number;
  riskState: 'CRS-0' | 'CRS-1' | 'CRS-2' | 'CRS-3'; // Crisis Response State
  totalCapitalSecured: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranchePosition {
  id: string;
  userId: string;
  trancheId: string;
  unitsPurchased: number;
  costBasis: number;
  accruedYield: number;
  purchasedAt: Date;
}

// Order Book and Execution Schema
export interface Order {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  instrumentType: 'nil_arbitrage' | 'yield_tranche';
  instrumentId: string;
  quantity: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled' | 'partial';
  executedAt?: Date;
  createdAt: Date;
}

export interface Trade {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  instrumentId: string;
  quantity: number;
  executionPrice: number;
  executedAt: Date;
}

// User and Account Schema
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  walletAddress?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  accountType: 'retail' | 'institutional';
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  accountType: 'fiat' | 'crypto' | 'brokerage_fix';
  liquidityBalance: number;
  marginBalance: number;
  marginUtilized: number;
  status: 'active' | 'frozen';
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'yield_payout';
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string; // For blockchain transactions
  createdAt: Date;
}

// Risk Management Schema
export interface VolatilityMetric {
  id: string;
  athleteId?: string;
  trancheId?: string;
  interactionLatency: number; // Lt - milliseconds
  engagementVelocity: number; // Positive/negative trend
  dwellTime: number; // User engagement duration
  zScore: number; // Deviation from baseline
  timestamp: Date;
}

export interface CircuitBreakerEvent {
  id: string;
  trancheId: string;
  triggeringMetric: 'latency' | 'dwell_time' | 'velocity';
  severity: 'CRS-0' | 'CRS-1' | 'CRS-2' | 'CRS-3';
  action: 'none' | 'freeze_ads' | 'hedge' | 'liquidate';
  executedAt: Date;
  capitalPreserved: number;
}

export interface ParametricHedge {
  id: string;
  trancheId: string;
  triggeringEvent: string;
  hedgeType: 'inverse_position' | 'cash_equivalent' | 'swap';
  amount: number;
  executedAt: Date;
  status: 'active' | 'unwound';
}
