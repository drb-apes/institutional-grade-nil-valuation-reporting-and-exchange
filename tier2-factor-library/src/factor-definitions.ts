/**
 * BLEI-E Factor Definitions (TypeScript)
 * Cross-Institutional Factor Library
 */

export interface BaseFactor {
  athlete_id: string;
  timestamp: number;
  raw_value: number;
  zscore: number;
  percentile: number;
  volatility_adjusted_pct: number;
}

/**
 * PMF-E: Performance Momentum Factor - Equity
 */
export interface PMFEFactor extends BaseFactor {
  momentum_direction: "positive" | "negative" | "neutral";
  performance_delta_pct: number;  // % change in performance
  injury_recovery_status: "healthy" | "recovering" | "injured";
  training_load: number;  // 0-100 scale
}

/**
 * SEF-E: Sentiment & Emotion Factor - Equity
 */
export interface SEFEFactor extends BaseFactor {
  sentiment_score: number;  // -1 to +1
  sentiment_zscore: number;
  sentiment_percentile: number;
  emotional_volatility: number;  // Standard dev of sentiment swings
  trend: "improving" | "declining" | "stable";
  sources: {
    social_media: number;     // Twitter, Instagram, TikTok
    traditional_media: number;  // News, articles
    fan_sentiment: number;    // Fan communities
  };
}

/**
 * VVE-E: Virality & Visibility Factor - Equity
 */
export interface VVEEFactor extends BaseFactor {
  virality_velocity: number;  // Mentions per hour (normalized)
  visibility_percentile: number;  // 0-100
  engagement_rate: number;  // Interactions per mention
  trend_direction: "accelerating" | "stable" | "decelerating";
  half_life_minutes: number;  // Time for virality to decay 50%
  trending_rank: number;  // Rank on trending lists
  platform_breakdown: {
    twitter_mentions: number;
    instagram_engagement: number;
    tiktok_views: number;
    youtube_engagement: number;
  };
}

/**
 * FBR-E: Financial Behavior & Risk Factor - Equity
 */
export interface FBREFactor extends BaseFactor {
  financial_stress_score: number;  // 0 (healthy) to 1 (stressed)
  risk_indicator: number;  // -1 to +1
  revenue_stability: number;  // 0-100
  contract_renewal_risk: "low" | "medium" | "high";
  sponsorship_revenue_delta_pct: number;
  endorsement_pipeline_health: number;  // 0-1
}

/**
 * CSE-E: Compliance & Stability Factor - Equity
 */
export interface CSEEFactor extends BaseFactor {
  compliance_score: number;  // 0-1 (1 = fully compliant)
  stability_indicator: number;  // 0-1 (1 = stable)
  event_type: "none" | "injury" | "suspension" | "contract_change" | "legal" | "disciplinary";
  source_count: number;  // Number of confirming sources
  validation_status: "unvalidated" | "one_source" | "validated" | "rejected";
  league_status: string;  // "active", "suspended", etc.
  last_confirmed_at: number;  // Timestamp of last confirmation
}

/**
 * Aggregated BLEI-E Factors (matches risk engine)
 */
export interface AggregatedBLEIFactors {
  athlete_id: string;
  timestamp: number;
  PMF_E: PMFEFactor;
  SEF_E: SEFEFactor;
  VVE_E: VVEEFactor;
  FBR_E: FBREFactor;
  CSE_E: CSEEFactor;
}
