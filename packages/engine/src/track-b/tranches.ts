import { determineCrs, evaluateRiskState, type CrisisState } from '@ig-nil/shared';

export interface CampaignTranche {
  id: string;
  className: 'senior' | 'mezzanine' | 'junior';
  apy: number;
  principal: number;
  riskBand: CrisisState;
}

export function deriveYieldCampaignSummary(principal: number, revenueSweep: number, latency: number, dwellTime: number, engagementVelocity: number, spendShock: number, athleteOutputShock: number) {
  const score = evaluateRiskState({ latency, dwellTime, engagementVelocity, spendShock, athleteOutputShock });
  const riskBand = determineCrs(score);

  const apy = revenueSweep * 1.7 + (riskBand === 'CRS-0' ? 8 : riskBand === 'CRS-1' ? 4 : riskBand === 'CRS-2' ? 1.5 : 0.2);
  const protectedPrincipal = principal * (riskBand === 'CRS-3' ? 0.94 : 1);

  return {
    score,
    riskBand,
    apy: Number(apy.toFixed(2)),
    protectedPrincipal: Number(protectedPrincipal.toFixed(2)),
    hedgeTriggered: riskBand === 'CRS-3',
  };
}

export function buildTranches(principal: number): CampaignTranche[] {
  return [
    { id: 'T-1', className: 'senior', apy: 9.6, principal: principal * 0.5, riskBand: 'CRS-0' },
    { id: 'T-2', className: 'mezzanine', apy: 15.4, principal: principal * 0.3, riskBand: 'CRS-1' },
    { id: 'T-3', className: 'junior', apy: 21.8, principal: principal * 0.2, riskBand: 'CRS-2' },
  ];
}
