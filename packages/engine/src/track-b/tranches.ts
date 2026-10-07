import {
  determineCrs,
  evaluateRiskState,
  computeYieldApy,
  computePrincipalProtection,
  shouldTriggerHedge,
  shouldActivateCircuitBreaker,
  type CrisisState,
  type Campaign,
  type Tranche,
  type RiskInputs,
} from '@ig-nil/shared';

/**
 * Derive comprehensive campaign yield summary.
 * Includes APY, principal protection, hedge triggers, and risk state.
 */
export function deriveYieldCampaignSummary(
  campaign: Campaign,
  riskInputs: RiskInputs,
): {
  score: number;
  riskBand: CrisisState;
  apy: number;
  protectedPrincipal: number;
  hedgeTriggered: boolean;
  circuitBreakerActive: boolean;
} {
  const score = evaluateRiskState(riskInputs);
  const riskBand = determineCrs(score);

  const baseApy = campaign.revenueSweepPercent * 1.7 + 8;
  const apy = computeYieldApy(baseApy, riskBand);
  const protectedPrincipal = computePrincipalProtection(
    campaign.principal,
    riskBand,
  );

  return {
    score,
    riskBand,
    apy,
    protectedPrincipal,
    hedgeTriggered: shouldTriggerHedge(riskBand),
    circuitBreakerActive: shouldActivateCircuitBreaker(riskBand),
  };
}

/**
 * Build tranche ladder from campaign principal.
 * Senior (50%), Mezzanine (30%), Junior (20%).
 * APY and risk ladder as well.
 */
export function buildTranches(campaignId: string, principal: number): Tranche[] {
  const now = new Date();
  return [
    {
      id: `T-${campaignId}-1`,
      campaignId,
      className: 'senior',
      apy: 9.6,
      principal: principal * 0.5,
      riskBand: 'CRS-0',
      unitsOutstanding: principal * 0.5,
      unitPrice: 1.0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `T-${campaignId}-2`,
      campaignId,
      className: 'mezzanine',
      apy: 15.4,
      principal: principal * 0.3,
      riskBand: 'CRS-1',
      unitsOutstanding: principal * 0.3,
      unitPrice: 1.0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `T-${campaignId}-3`,
      campaignId,
      className: 'junior',
      apy: 21.8,
      principal: principal * 0.2,
      riskBand: 'CRS-2',
      unitsOutstanding: principal * 0.2,
      unitPrice: 1.0,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Compute real-time yield payout from revenue sweep.
 * Based on time elapsed and sweep percentage.
 */
export function computePayoutAccrual(
  principal: number,
  revenueSweepPercent: number,
  apy: number,
  elapsedHours: number,
): number {
  const revenuePortion = principal * (revenueSweepPercent / 100);
  const hourlyYield = (apy / 100) * principal / (365 * 24);
  const accruedYield = revenuePortion * 0.1 + hourlyYield * elapsedHours;
  return Number(accruedYield.toFixed(2));
}

/**
 * Trigger parametric hedge on campaign.
 * Routes capital to safe instruments and pauses yield accrual.
 */
export function initializeHedge(
  campaignId: string,
  riskLevel: CrisisState,
  trigger: string,
): {
  hedgeId: string;
  action: string;
  capitalReserved: number;
} {
  const hedgeId = `HDG-${campaignId}-${Date.now()}`;
  let action = 'monitor';
  let capitalReserved = 0;

  if (riskLevel === 'CRS-2') {
    action = 'reduce-exposure';
    capitalReserved = 0.1; // 10% to hedges
  } else if (riskLevel === 'CRS-3') {
    action = 'freeze-campaign';
    capitalReserved = 0.25; // 25% to hedges
  }

  return {
    hedgeId,
    action,
    capitalReserved,
  };
}
