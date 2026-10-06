import { Router } from 'express';
import { calculateDivergence, calculateMarketNil, calculateModelNil } from '@ig-nil/shared';

const router = Router();

const athleteProfiles = {
  1: {
    id: 1,
    athleteName: 'Ava Thompson',
    position: 'Wing',
    team: 'North State',
    baseValue: 42000,
    performance: 0.92,
    sponsorshipFit: 0.81,
    mediaVelocity: 1.28,
    socialDemand: 0.88,
    biometricStability: 0.9,
    fatiguePenalty: 0.08,
    riskDiscount: 0.06,
    volatilityPenalty: 0.04,
  }
};

const telemetry = {
  1: {
    heartRateVariability: 72,
    readiness: 88,
    explosiveOutput: 91,
    fatigue: 22,
    recovery: 81,
    engagementVelocity: 1.4,
    latency: 120,
  }
};

router.get('/athletes/:id/divergence', (req, res) => {
  const athleteId = Number(req.params.id);
  const athlete = athleteProfiles[athleteId as keyof typeof athleteProfiles];

  if (!athlete) {
    res.status(404).json({ message: 'Athlete not found' });
    return;
  }

  const metrics = telemetry[athleteId as keyof typeof telemetry];
  const modelNil = calculateModelNil({
    baseValue: athlete.baseValue,
    performance: athlete.performance,
    sponsorshipFit: athlete.sponsorshipFit,
    mediaVelocity: athlete.mediaVelocity,
    socialDemand: athlete.socialDemand,
    biometricStability: athlete.biometricStability,
    fatiguePenalty: athlete.fatiguePenalty,
    riskDiscount: athlete.riskDiscount,
    volatilityPenalty: athlete.volatilityPenalty,
  }, {
    heartRateVariability: metrics?.heartRateVariability ?? 65,
    readiness: metrics?.readiness ?? 70,
    explosiveOutput: metrics?.explosiveOutput ?? 75,
    fatigue: metrics?.fatigue ?? 35,
    recovery: metrics?.recovery ?? 70,
    engagementVelocity: metrics?.engagementVelocity ?? 1,
    latency: metrics?.latency ?? 150,
  }, {
    followerGrowth: 0.14,
    engagementRate: 0.19,
    sponsorInterest: 0.72,
    marketSentiment: 0.64,
  });

  const marketNil = calculateMarketNil(820, 2.5);
  const divergence = calculateDivergence(modelNil, marketNil);

  res.json({
    athleteId,
    athleteName: athlete.athleteName,
    modelNil,
    marketNil,
    divergence,
    spreadPercent: (divergence / marketNil) * 100,
  });
});

export default router;
