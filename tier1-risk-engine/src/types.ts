/**
 * BLEI-E Cross-Institutional Risk Engine
 * TypeScript Type Definitions
 */

// ============================================================================
// BLEI-E FACTORS
// ============================================================================

export interface BLEIFactors {
  PMF_E: number;  // Performance Momentum Factor - Equity
  SEF_E: number;  // Sentiment & Emotion Factor - Equity
  VVE_E: number;  // Virality & Visibility Factor - Equity
  FBR_E: number;  // Financial Behavior & Risk Factor - Equity
  CSE_E: number;  // Compliance & Stability Factor - Equity
}

export interface NormalizedFactors extends BLEIFactors {
  PMF_E_zscore: number;
  SEF_E_zscore: number;
  VVE_E_zscore: number;
  FBR_E_zscore: number;
  CSE_E_zscore: number;
  //
  PMF_E_percentile: number;
  SEF_E_percentile: number;
  VVE_E_percentile: number;
  FBR_E_percentile: number;
  CSE_E_percentile: number;
  //
  vol_adjusted_pct: number;  // Volatility adjustment (% change)
}

// ============================================================================
// RISK STATE ENGINE
// ============================================================================

export type RiskState = 0 | 1 | 2 | 3 | 4;

export interface CRSOutput {
  athlete_id: string;
  timestamp: number;
  crs: number;  // Composite Risk Score
  state: RiskState;
  factors: BLEIFactors;
  normalized_factors: NormalizedFactors;
  hedgeActions: HedgeAction[];
  exposures: AssetExposure[];
  contagionPaths: ContagionPath[];
  auditHash: string;  // SHA256 for reproducibility
  reproductionKey: string;  // Deterministic replay key
}

export interface RiskStateMetadata {
  state: RiskState;
  meaning: string;
  action: string;
  urgency: "immediate" | "elevated" | "monitor" | "none";
}

// ============================================================================
// HEDGE ACTIONS
// ============================================================================

export interface HedgeAction {
  state: RiskState;
  asset: string;  // Nike, Adidas, Disney, DraftKings, etc.
  action_type: "reduce" | "add_vol" | "rv_rotate" | "exit" | "put_hedge" | "long_competitor" | "long_virality" | "long_betting";
  notional_usd: number;
  urgency: "immediate" | "queue" | "monitor";
  rationale: string;
  suggested_execution_window_minutes: number;
}

// ============================================================================
// CROSS-ASSET MAPPING
// ============================================================================

export interface BetaMatrix {
  [asset: string]: BLEIFactors;  // Beta coefficients per factor
}

export interface AssetExposure {
  asset: string;
  notional_usd: number;
  beta_pct: number;  // β sensitivity to CRS
  implied_move_pct: number;  // Expected move if CRS changes 1 std dev
  regime: "stable" | "unstable" | "post_earnings";
  beta_drift_pct: number;  // Current drift from baseline
}

// ============================================================================
// CONTAGION MODELING
// ============================================================================

export interface ContagionPath {
  source_asset: string;
  destination_asset: string;
  hours_elapsed: number;
  decay_multiplier: number;  // Remaining impact
  half_life_hours: number;
  estimated_impact_pct: number;  // Expected impact on destination
}

export interface ContagionMatrix {
  [fromAsset: string]: {
    [toAsset: string]: {
      half_life_hours: number;
      lambda: number;  // Decay constant
      empirical_correlation: number;  // Measured correlation
    }
  }
}

// ============================================================================
// REGIME DETECTION
// ============================================================================

export type MarketRegime = "stable" | "unstable" | "post_earnings" | "volatility_spike";

export interface RegimeState {
  regime: MarketRegime;
  vol_percentile: number;  // Current volatility percentile (0–100)
  time_since_earnings_days: number;
  estimated_beta_drift_pct: number;
}

// ============================================================================
// COMPLIANCE & CSE-E VALIDATION
// ============================================================================

export interface CSEValidationGate {
  cse_score: number;
  sources_count: number;  // Number of confirming sources
  requires_two_source: boolean;
  validation_status: "unvalidated" | "one_source" | "validated" | "rejected";
  reason: string;
  blocking_state_4: boolean;  // Is State 4 blocked due to CSE-E?
}

export interface ComplianceEvent {
  athlete_id: string;
  event_type: "rumor" | "confirmed_injury" | "disciplinary" | "negative_sentiment" | "league_action";
  source: string;
  confidence: number;  // 0–1
  timestamp: number;
}

// ============================================================================
// KAFKA/KINESIS SIGNAL INGESTION
// ============================================================================

export interface AthleteSignal {
  athlete_id: string;
  timestamp: number;
  //
  biometric_delta: number;  // Biometric change (% or z-score)
  stress_load: number;
  fatigue_gradient: number;
  emotional_volatility: number;
  //
  virality_velocity: number;  // Social mentions/hour
  media_sentiment: number;  // -1 to +1
  injury_risk_window: boolean;
  //
  game_day_telemetry: {
    performance_level: number;
    exertion_pct: number;
  } | null;
}

// ============================================================================
// BACKTESTING
// ============================================================================

export interface BacktestConfig {
  sponsor_universe: string[];  // ["Nike", "Adidas", "Disney", "DraftKings"]
  backtest_window_years: number;  // 2 or 5
  resolution: "daily" | "intraday";  // Event → return timing
  min_events: number;  // Minimum events to use
  rebalance_frequency: "daily" | "weekly";
  transaction_cost_bps: number;  // Basis points
}

export interface BacktestResult {
  sharpe_ratio: number;
  max_drawdown_pct: number;
  cumulative_return_pct: number;
  win_rate_pct: number;
  total_trades: number;
  avg_trade_duration_days: number;
  regime_stable_sharpe: number;
  regime_unstable_sharpe: number;
  //
  beta_matrix_output: BetaMatrix;
  regime_stats: {
    stable: { beta_drift_pct: number; half_life_days: number };
    unstable: { beta_drift_pct: number; half_life_days: number };
  };
}

// ============================================================================
// AUDIT & REPRODUCIBILITY
// ============================================================================

export interface AuditLogEntry {
  timestamp: number;
  athlete_id: string;
  event: "signal_ingested" | "factor_normalized" | "crs_computed" | "state_assigned" | "hedge_action_generated" | "cse_validation_gated" | "state_downgraded";
  details: Record<string, unknown>;
  hash: string;
}

export interface ReproductibilityKey {
  athlete_id: string;
  timestamp: number;
  input_hash: string;  // Hash of input signals
  beta_matrix_hash: string;  // Hash of beta coefficients used
  config_hash: string;  // Hash of CRS weights, thresholds
  expected_crs_hash: string;  // Expected output hash (for replay)
}

// ============================================================================
// PORTFOLIO OVERLAY
// ============================================================================

export interface PortfolioOverlay {
  athlete_cohort_id: string;
  total_notional_usd: number;
  equity_ls_adjustment: {
    long_weight_adjustment_pct: number;
    short_weight_adjustment_pct: number;
  };
  volatility_overlay: {
    add_gamma: boolean;
    add_skew: boolean;
    add_event_driven_vol: boolean;
  };
  cross_asset_overlay: {
    media_to_betting_contagion_pct: number;
    sponsor_to_consumer_contagion_pct: number;
  };
  risk_premia: {
    behavioral_vol_premium: number;
    virality_momentum_premium: number;
    performance_momentum_premium: number;
  };
}
