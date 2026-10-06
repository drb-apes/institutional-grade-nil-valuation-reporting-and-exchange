import {
  calculateDivergence,
  calculateMarketNil,
  calculateModelNil,
  calculateSpreadPercent,
  type AthleteProfile,
  type AthleteTelemetry,
  type DemandSignals,
  type MarketQuote,
} from '@ig-nil/shared';

/**
 * Build a complete Track A market quote.
 * Includes model value, market price, divergence, and opportunity classification.
 */
export function buildTrackAQuote(
  athlete: AthleteProfile,
  telemetry: AthleteTelemetry,
  demand: DemandSignals,
  units: number,
): MarketQuote {
  const modelNil = calculateModelNil(athlete, telemetry, demand);
  const marketNil = calculateMarketNil(units, 2.5);
  const divergence = calculateDivergence(modelNil, marketNil);
  const spreadPercent = calculateSpreadPercent(divergence, marketNil);

  return {
    athleteId: athlete.id,
    modelNil,
    marketNil,
    divergence,
    spreadPercent,
    bid: Math.max(0, marketNil - 50),
    ask: marketNil + 50,
    volume24h: units * 2.5 * 0.15, // estimate from units
    timestamp: new Date(),
  };
}

/**
 * Classify arbitrage opportunity.
 * Long-alpha: model > market (undervalued)
 * Risk-off: market > model (overvalued)
 * Neutral: within spread tolerance
 */
export function classifyOpportunity(
  spreadPercent: number,
): 'long-alpha' | 'risk-off' | 'neutral' {
  if (spreadPercent > 5) return 'long-alpha';
  if (spreadPercent < -5) return 'risk-off';
  return 'neutral';
}

/**
 * Compute settlement price for an athlete buyout.
 * Factors in volume discount, historical volatility, and sponsor demand.
 */
export function computeBuyoutSettlement(
  marketNil: number,
  volume: number,
  historicalVolatility: number,
  sponsorDemandFactor: number,
): number {
  const volumeDiscount = Math.max(0.9, 1 - volume * 0.0001);
  const volatilityPremium = 1 + historicalVolatility * 0.15;
  const demandPremium = 1 + sponsorDemandFactor * 0.2;

  return Number(
    (marketNil * volumeDiscount * volatilityPremium * demandPremium).toFixed(2),
  );
}
