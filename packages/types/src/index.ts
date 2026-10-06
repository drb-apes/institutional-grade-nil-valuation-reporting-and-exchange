export type SentimentState = 'recovery' | 'stable' | 'risk-on';

export type RiskState = 'CRS-0' | 'CRS-1' | 'CRS-2' | 'CRS-3';

export interface NILMarket {
  id: string;
  name: string;
  modelNil: number;
  marketNil: number;
  spread: number;
  sentiment: SentimentState;
}

export interface YieldCampaign {
  id: string;
  name: string;
  apy: number;
  riskState: RiskState;
  capitalSecured: number;
  trancheUnits: number;
}
