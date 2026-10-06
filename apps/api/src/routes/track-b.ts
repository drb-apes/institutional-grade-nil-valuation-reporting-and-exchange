import { Router } from 'express';
import { determineCrs, evaluateRiskState } from '@ig-nil/shared';

const router = Router();

router.get('/campaigns/:id/summary', (req, res) => {
  const campaignId = Number(req.params.id);
  const campaign = {
    id: campaignId,
    sponsor: 'NorthPeak Energy',
    principal: 500000,
    revenueSweepPercent: 10,
    apy: 18.4,
    crs: determineCrs(
      evaluateRiskState({
        latency: 110,
        dwellTime: 0.82,
        engagementVelocity: 1.1,
        spendShock: 0.3,
        athleteOutputShock: 0.2,
      })
    ),
    activeTranches: 3,
    capitalSecured: 265000,
  };

  res.json(campaign);
});

export default router;
