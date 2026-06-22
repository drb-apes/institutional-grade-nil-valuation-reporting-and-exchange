/**
 * BLEI-E Factor Factory
 * Creates and normalizes BLEI-E factors from raw athlete signals
 */

import { PMFEFactor, SEFEFactor, VVEEFactor, FBREFactor, CSEEFactor } from './factor-definitions';

interface RawPMFInput {
  performance_delta_pct: number;
  athlete_id: string;
  timestamp: number;
  injury_status?: "healthy" | "recovering" | "injured";
  training_load?: number;  // 0-100
}

interface RawSEFInput {
  sentiment_score: number;  // -1 to +1
  athlete_id: string;
  timestamp: number;
  social_media_sentiment?: number;
  traditional_media_sentiment?: number;
  fan_sentiment?: number;
  emotional_volatility?: number;
}

interface RawVVEInput {
  virality_velocity: number;  // mentions/hour
  athlete_id: string;
  timestamp: number;
  engagement_rate?: number;
  trending_rank?: number;
  platform_breakdown?: {
    twitter?: number;
    instagram?: number;
    tiktok?: number;
    youtube?: number;
  };
}

interface RawFBRInput {
  financial_stress_score: number;  // 0-1
  athlete_id: string;
  timestamp: number;
  sponsorship_revenue_delta_pct?: number;
  contract_renewal_risk?: "low" | "medium" | "high";
}

interface RawCSEInput {
  event_type: "none" | "injury" | "suspension" | "contract_change" | "legal" | "disciplinary";
  athlete_id: string;
  timestamp: number;
  source_count: number;
  league_status?: string;
}

export class FactorFactory {
  private athleteStats: Map<string, { mean: number; stddev: number }> = new Map();

  constructor() {
    // Initialize with default cross-athlete statistics
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Pre-computed cross-athlete baselines
    this.athleteStats.set('performance', { mean: 0, stddev: 1 });
    this.athleteStats.set('sentiment', { mean: 0.2, stddev: 0.35 });
    this.athleteStats.set('virality', { mean: 50, stddev: 120 });
    this.athleteStats.set('financial_stress', { mean: 0.3, stddev: 0.25 });
  }

  /**
   * Create PMF-E Factor
   */
  public createPMFE(input: RawPMFInput): PMFEFactor {
    const stats = this.athleteStats.get('performance')!;
    const zscore = (input.performance_delta_pct - stats.mean) / stats.stddev;
    const percentile = this.zscoreToPercentile(zscore);

    return {
      athlete_id: input.athlete_id,
      timestamp: input.timestamp,
      raw_value: input.performance_delta_pct,
      zscore,
      percentile,
      volatility_adjusted_pct: input.performance_delta_pct / (stats.stddev || 1),
      momentum_direction:
        input.performance_delta_pct > 0.5 ? 'positive' : input.performance_delta_pct < -0.5 ? 'negative' : 'neutral',
      performance_delta_pct: input.performance_delta_pct,
      injury_recovery_status: input.injury_status || 'healthy',
      training_load: input.training_load || 50,
    };
  }

  /**
   * Create SEF-E Factor
   */
  public createSEFE(input: RawSEFInput): SEFEFactor {
    const stats = this.athleteStats.get('sentiment')!;
    const zscore = (input.sentiment_score - stats.mean) / stats.stddev;
    const percentile = this.zscoreToPercentile(zscore);

    return {
      athlete_id: input.athlete_id,
      timestamp: input.timestamp,
      raw_value: input.sentiment_score,
      zscore,
      percentile,
      volatility_adjusted_pct: (input.sentiment_score - stats.mean) / (stats.stddev || 1),
      sentiment_score: input.sentiment_score,
      sentiment_zscore: zscore,
      sentiment_percentile: percentile,
      emotional_volatility: input.emotional_volatility || 0.1,
      trend: input.sentiment_score > 0.3 ? 'improving' : input.sentiment_score < -0.3 ? 'declining' : 'stable',
      sources: {
        social_media: input.social_media_sentiment || 0,
        traditional_media: input.traditional_media_sentiment || 0,
        fan_sentiment: input.fan_sentiment || 0,
      },
    };
  }

  /**
   * Create VVE-E Factor
   */
  public createVVEE(input: RawVVEInput): VVEEFactor {
    const stats = this.athleteStats.get('virality')!;
    const zscore = (input.virality_velocity - stats.mean) / stats.stddev;
    const percentile = this.zscoreToPercentile(zscore);

    return {
      athlete_id: input.athlete_id,
      timestamp: input.timestamp,
      raw_value: input.virality_velocity,
      zscore,
      percentile,
      volatility_adjusted_pct: (input.virality_velocity - stats.mean) / (stats.stddev || 1),
      virality_velocity: input.virality_velocity,
      visibility_percentile: percentile,
      engagement_rate: input.engagement_rate || 0.15,
      trend_direction: input.virality_velocity > stats.mean + stats.stddev ? 'accelerating' : 'stable',
      half_life_minutes: 120,  // Default 2 hours
      trending_rank: input.trending_rank || 100,
      platform_breakdown: input.platform_breakdown || {
        twitter_mentions: 0,
        instagram_engagement: 0,
        tiktok_views: 0,
        youtube_engagement: 0,
      },
    };
  }

  /**
   * Create FBR-E Factor
   */
  public createFBRE(input: RawFBRInput): FBREFactor {
    const stats = this.athleteStats.get('financial_stress')!;
    const zscore = (input.financial_stress_score - stats.mean) / stats.stddev;
    const percentile = this.zscoreToPercentile(zscore);

    return {
      athlete_id: input.athlete_id,
      timestamp: input.timestamp,
      raw_value: input.financial_stress_score,
      zscore,
      percentile,
      volatility_adjusted_pct: (input.financial_stress_score - stats.mean) / (stats.stddev || 1),
      financial_stress_score: input.financial_stress_score,
      risk_indicator: input.financial_stress_score > 0.6 ? 1 : input.financial_stress_score < 0.3 ? -1 : 0,
      revenue_stability: (1 - input.financial_stress_score) * 100,
      contract_renewal_risk: input.contract_renewal_risk || 'low',
      sponsorship_revenue_delta_pct: input.sponsorship_revenue_delta_pct || 0,
      endorsement_pipeline_health: 0.75,  // Pre-computed
    };
  }

  /**
   * Create CSE-E Factor
   */
  public createCSEE(input: RawCSEInput): CSEEFactor {
    const validationStatus =
      input.source_count >= 2 ? 'validated' : input.source_count === 1 ? 'one_source' : 'unvalidated';

    return {
      athlete_id: input.athlete_id,
      timestamp: input.timestamp,
      raw_value: input.event_type === 'none' ? 1.0 : 0.5,
      zscore: input.event_type === 'none' ? 0 : -1,
      percentile: input.event_type === 'none' ? 50 : 25,
      volatility_adjusted_pct: 0,
      compliance_score: input.event_type === 'none' ? 1.0 : 0.5,
      stability_indicator: input.event_type === 'none' ? 1.0 : 0.3,
      event_type: input.event_type,
      source_count: input.source_count,
      validation_status: validationStatus as any,
      league_status: input.league_status || 'active',
      last_confirmed_at: input.timestamp,
    };
  }

  /**
   * Convert z-score to percentile (using normal distribution approximation)
   */
  private zscoreToPercentile(zscore: number): number {
    // Simple approximation; in production, use a proper CDF
    const percentile = 50 + 34.1 * Math.tanh(zscore / 2);
    return Math.max(0, Math.min(100, percentile));
  }
}

export const factorFactory = new FactorFactory();
