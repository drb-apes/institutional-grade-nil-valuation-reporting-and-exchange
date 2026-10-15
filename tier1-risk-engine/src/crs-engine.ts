/**
 * BLEI-E CRS Engine: Core Risk State Calculation
 * Cross-Institutional Implementation
 */

import { BLEIFactors, NormalizedFactors, CRSOutput, RiskState, CSEValidationGate } from './types';

interface CRSWeights {
  w1: number;  // PMF_E weight
  w2: number;  // SEF_E weight
  w3: number;  // VVE_E weight
  w4: number;  // FBR_E weight
  w5: number;  // CSE_E weight (subtracted)
}

interface RiskThresholds {
  state_1_upper: number;  // Watch
  state_2_upper: number;  // Elevated
  state_3_upper: number;  // High Risk
  state_4_lower: number;  // Critical
}

const DEFAULT_WEIGHTS: CRSWeights = {
  w1: 0.28,  // PMF_E: 28% (performance is primary)
  w2: 0.18,  // SEF_E: 18% (sentiment secondary)
  w3: 0.32,  // VVE_E: 32% (virality is strong predictor)
  w4: 0.15,  // FBR_E: 15% (financial behavior tertiary)
  w5: 0.22,  // CSE_E: 22% (compliance reduces risk)
};

const DEFAULT_THRESHOLDS: RiskThresholds = {
  state_1_upper: 0.5,
  state_2_upper: 1.0,
  state_3_upper: 1.8,
  state_4_lower: 2.5,
};

export class CRSEngine {
  private weights: CRSWeights;
  private thresholds: RiskThresholds;

  constructor(weights?: Partial<CRSWeights>, thresholds?: Partial<RiskThresholds>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Compute Composite Risk Score (CRS)
   */
  public computeCRS(factors: NormalizedFactors): number {
    // Use z-scores for consistency
    const crs =
      this.weights.w1 * factors.PMF_E_zscore +
      this.weights.w2 * factors.SEF_E_zscore +
      this.weights.w3 * factors.VVE_E_zscore +
      this.weights.w4 * factors.FBR_E_zscore -
      this.weights.w5 * factors.CSE_E_zscore;

    return crs;
  }

  /**
   * Assign risk state based on CRS
   */
  public assignRiskState(crs: number): RiskState {
    if (crs <= 0.5) return 0;  // Stable
    if (crs <= 1.0) return 1;  // Watch
    if (crs <= 1.8) return 2;  // Elevated
    if (crs <= 2.5) return 3;  // High Risk
    return 4;                   // Critical
  }

  /**
   * Check if state should be downgraded due to CSE-E validation gate
   */
  public applyCSEValidationGate(
    state: RiskState,
    cseGate: CSEValidationGate
  ): { state: RiskState; blocked: boolean; reason: string } {
    // State 4 requires two-source CSE-E validation
    if (state === 4 && cseGate.sources_count < 2) {
      return {
        state: 3,
        blocked: true,
        reason: `State 4 downgraded to State 3: CSE-E validation requires 2 sources, only ${cseGate.sources_count} found`,
      };
    }

    // State 3 with rejected CSE-E should be reconsidered
    if (state === 3 && cseGate.validation_status === "rejected") {
      return {
        state: 2,
        blocked: true,
        reason: `State 3 downgraded to State 2: CSE-E validation rejected (${cseGate.reason})`,
      };
    }

    return { state, blocked: false, reason: "" };
  }

  /**
   * Generate a reproducible audit hash for the CRS calculation
   */
  public generateAuditHash(
    athleteId: string,
    timestamp: number,
    factors: NormalizedFactors,
    crs: number,
    state: RiskState
  ): string {
    // Simple hash (in production, use crypto.subtle.digest with SHA-256)
    const data = JSON.stringify({
      athlete_id: athleteId,
      timestamp,
      factors: {
        PMF_E_zscore: factors.PMF_E_zscore,
        SEF_E_zscore: factors.SEF_E_zscore,
        VVE_E_zscore: factors.VVE_E_zscore,
        FBR_E_zscore: factors.FBR_E_zscore,
        CSE_E_zscore: factors.CSE_E_zscore,
      },
      crs,
      state,
      weights: this.weights,
    });

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;  // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Full CRS computation pipeline with validation
   */
  public computeFull(
    athleteId: string,
    factors: NormalizedFactors,
    cseGate: CSEValidationGate
  ): {
    crs: number;
    initialState: RiskState;
    finalState: RiskState;
    blocked: boolean;
    reason: string;
    auditHash: string;
  } {
    const crs = this.computeCRS(factors);
    const initialState = this.assignRiskState(crs);
    const { state: finalState, blocked, reason } = this.applyCSEValidationGate(initialState, cseGate);
    const auditHash = this.generateAuditHash(athleteId, Date.now(), factors, crs, finalState);

    return { crs, initialState, finalState, blocked, reason, auditHash };
  }
}

// Export singleton instance
export const crsEngine = new CRSEngine();
