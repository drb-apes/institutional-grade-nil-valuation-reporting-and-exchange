import type { CrisisState, RiskInputs } from './types.js';

/**
 * Evaluate composite risk score from five key signals.
 *
 * - latency: network/system delay in milliseconds
 * - dwellTime: median user session duration as fraction of baseline (0-1)
 * - engagementVelocity: real-time engagement rate vs historical baseline
 * - spendShock: unexpected surge in sponsor spend (0-1)
 * - athleteOutputShock: sudden drop in athlete performance (0-1)
 *
 * Score interpretation:
 * 0.0 - 0.54 = CRS-0 (normal)
 * 0.55 - 0.89 = CRS-1 (elevated)
 * 0.9 - 1.29 = CRS-2 (stressed)
 * >= 1.3 = CRS-3 (crisis)
 */
export function evaluateRiskState({
  latency,
  dwellTime,
  engagementVelocity,
  spendShock,
  athleteOutputShock,
}: RiskInputs): number {
  // Normalize latency: 100ms baseline, 300ms ceiling
  const normalizedLatency = Math.max(0, Math.min(1, (latency - 100) / 200));

  // Normalize dwell time: expect 0.6+ of baseline
  const normalizedDwell = Math.max(
    0,
    Math.min(1, (0.6 - dwellTime) / 0.6),
  );

  // Normalize engagement: expect 1.6+ of baseline
  const normalizedVelocity = Math.max(
    0,
    Math.min(1, (1.6 - engagementVelocity) / 1.6),
  );

  // Normalized spend shock (0-1 scale)
  const normalizedSpendShock = Math.max(0, Math.min(1, spendShock));

  // Normalized athlete output shock (0-1 scale)
  const normalizedAthleteShock = Math.max(
    0,
    Math.min(1, athleteOutputShock),
  );

  // Weighted composite
  const score =
    0.3 * normalizedLatency +
    0.25 * normalizedDwell +
    0.2 * normalizedVelocity +
    0.15 * normalizedSpendShock +
    0.1 * normalizedAthleteShock;

  return Number(score.toFixed(4));
}

/**
 * Determine CRS (Crisis Response State) from composite risk score.
 */
export function determineCrs(score: number): CrisisState {
  if (score >= 1.3) return 'CRS-3';
  if (score >= 0.9) return 'CRS-2';
  if (score >= 0.55) return 'CRS-1';
  return 'CRS-0';
}

/**
 * Compute APY adjustment based on CRS state and campaign fundamentals.
 */
export function computeYieldApy(
  baseApy: number,
  crs: CrisisState,
): number {
  const adjustments = {
    'CRS-0': 1.0, // full yield
    'CRS-1': 0.8, // 20% reduction
    'CRS-2': 0.5, // 50% reduction
    'CRS-3': 0.1, // 90% reduction + high protection cost
  };
  return Number((baseApy * adjustments[crs]).toFixed(2));
}

/**
 * Compute principal protection factor based on CRS state.
 * Higher CRS = more aggressive downside floor.
 */
export function computePrincipalProtection(
  principal: number,
  crs: CrisisState,
): number {
  const protectionFactors = {
    'CRS-0': 1.0, // full principal + yield
    'CRS-1': 0.98, // 2% cushion
    'CRS-2': 0.95, // 5% cushion
    'CRS-3': 0.94, // 6% cushion (hedge cost)
  };
  return Number((principal * protectionFactors[crs]).toFixed(2));
}

/**
 * Determine if automatic hedge should trigger based on CRS.
 */
export function shouldTriggerHedge(crs: CrisisState): boolean {
  return crs === 'CRS-2' || crs === 'CRS-3';
}

/**
 * Determine if circuit breaker should activate (freeze campaigns).
 */
export function shouldActivateCircuitBreaker(crs: CrisisState): boolean {
  return crs === 'CRS-3';
}
