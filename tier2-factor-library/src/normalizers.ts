/**
 * BLEI-E Factor Normalizers
 * Cross-Institutional Normalization Specs
 */

interface NormalizationConfig {
  zscore_window_days: number;  // Rolling window for z-score
  percentile_window_days: number;  // Rolling window for percentiles
  vol_adjustment_window_days: number;  // Volatility window
  cross_sport_adjustment: boolean;
}

const DEFAULT_CONFIG: NormalizationConfig = {
  zscore_window_days: 30,
  percentile_window_days: 60,
  vol_adjustment_window_days: 20,
  cross_sport_adjustment: true,
};

export class ZScoreNormalizer {
  private config: NormalizationConfig;

  constructor(config?: Partial<NormalizationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compute z-score: (value - mean) / stddev
   */
  public normalize(value: number, mean: number, stddev: number): number {
    if (stddev === 0) return 0;
    return (value - mean) / stddev;
  }

  /**
   * Reverse z-score to get original value
   */
  public denormalize(zscore: number, mean: number, stddev: number): number {
    return zscore * stddev + mean;
  }
}

export class PercentileNormalizer {
  /**
   * Convert value to percentile rank within population
   */
  public normalize(value: number, population: number[]): number {
    const sorted = population.sort((a, b) => a - b);
    let count = 0;
    for (const p of sorted) {
      if (p <= value) count++;
    }
    return (count / population.length) * 100;
  }
}

export class VolatilityAdjuster {
  /**
   * Adjust value by realized volatility
   * vol_adjusted = raw_delta / realized_vol
   */
  public adjust(delta: number, realizedVol: number): number {
    if (realizedVol === 0) return delta;
    return delta / realizedVol;
  }

  /**
   * Reverse adjustment
   */
  public unadjust(adjDelta: number, realizedVol: number): number {
    return adjDelta * realizedVol;
  }
}

export class CrossAthleteHarmonizer {
  /**
   * Normalize across athletes despite different baselines
   * harmonized = (athlete_value - athlete_mean) / athlete_stddev
   */
  public harmonize(value: number, athleteMean: number, athleteStddev: number): number {
    if (athleteStddev === 0) return 0;
    return (value - athleteMean) / athleteStddev;
  }
}

export class CrossSportHarmonizer {
  private sportAdjustments: Map<string, number> = new Map([
    ['football', 1.0],
    ['basketball', 0.92],
    ['tennis', 1.05],
    ['baseball', 0.88],
    ['soccer', 0.95],
  ]);

  /**
   * Adjust factor for cross-sport comparability
   */
  public harmonize(value: number, sport: string): number {
    const adjustment = this.sportAdjustments.get(sport.toLowerCase()) || 1.0;
    return value * adjustment;
  }

  /**
   * Add custom sport adjustment
   */
  public registerSport(sport: string, adjustment: number): void {
    this.sportAdjustments.set(sport.toLowerCase(), adjustment);
  }
}

export class FactorNormalizationPipeline {
  private zscoreNormalizer: ZScoreNormalizer;
  private percentileNormalizer: PercentileNormalizer;
  private volAdjuster: VolatilityAdjuster;
  private crossAthleteHarmonizer: CrossAthleteHarmonizer;
  private crossSportHarmonizer: CrossSportHarmonizer;

  constructor(config?: Partial<NormalizationConfig>) {
    this.zscoreNormalizer = new ZScoreNormalizer(config);
    this.percentileNormalizer = new PercentileNormalizer();
    this.volAdjuster = new VolatilityAdjuster();
    this.crossAthleteHarmonizer = new CrossAthleteHarmonizer();
    this.crossSportHarmonizer = new CrossSportHarmonizer();
  }

  /**
   * Full normalization pipeline
   */
  public normalize(
    value: number,
    options: {
      athleteMean: number;
      athleteStddev: number;
      realizedVol: number;
      population: number[];
      sport: string;
    }
  ): {
    zscore: number;
    percentile: number;
    vol_adjusted: number;
    cross_sport_adjusted: number;
  } {
    const zscore = this.zscoreNormalizer.normalize(value, options.athleteMean, options.athleteStddev);
    const percentile = this.percentileNormalizer.normalize(value, options.population);
    const vol_adjusted = this.volAdjuster.adjust(value, options.realizedVol);
    const cross_sport_adjusted = this.crossSportHarmonizer.harmonize(zscore, options.sport);

    return { zscore, percentile, vol_adjusted, cross_sport_adjusted };
  }
}
