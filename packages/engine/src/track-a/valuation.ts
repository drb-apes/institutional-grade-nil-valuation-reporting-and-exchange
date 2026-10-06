import { calculateDivergence, calculateMarketNil, calculateModelNil, type AthleteProfile, type AthleteTelemetry, type DemandSignals } from '@ig-nil/shared';

export function buildTrackAQuote(
  athlete: AthleteProfile,
  telemetry: AthleteTelemetry,
  demand: DemandSignals,
  units: number,
) {
  const modelNil = calculateModelNil(athlete, telemetry, demand);
  const marketNil = calculateMarketNil(units, 2.5);
  const divergence = calculateDivergence(modelNil, marketNil);

  return {
    modelNil,
    marketNil,
    divergence,
    spreadPercent: (divergence / Math.max(1, marketNil)) * 100,
    opportunity: divergence > 0 ? 'long-alpha' : 'risk-off',
  };
}
