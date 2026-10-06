import express from 'express';
import type { NILMarket, YieldCampaign } from '@nil-exchange/types';

const app = express();
const port = Number(process.env.PORT ?? 4000);

const nilMarkets: NILMarket[] = [
  { id: 'athlete-001', name: 'Ari Kade', modelNil: 65, marketNil: 40, spread: 25, sentiment: 'recovery' },
  { id: 'athlete-002', name: 'Jalen Cross', modelNil: 72, marketNil: 61, spread: 11, sentiment: 'stable' },
];

const campaigns: YieldCampaign[] = [
  { id: 'camp-101', name: 'League Launch Week', apy: 14.2, riskState: 'CRS-1', capitalSecured: 520000, trancheUnits: 1000 },
  { id: 'camp-102', name: 'Creator Merch Drop', apy: 11.6, riskState: 'CRS-0', capitalSecured: 310000, trancheUnits: 860 },
];

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'nil-exchange-api' });
});

app.get('/markets', (_req, res) => {
  res.json(nilMarkets);
});

app.get('/campaigns', (_req, res) => {
  res.json(campaigns);
});

app.listen(port, () => {
  console.log(`NIL exchange API running on http://localhost:${port}`);
});
