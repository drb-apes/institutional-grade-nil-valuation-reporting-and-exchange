import type { NormalizedMetric } from '@ig-nil/shared';

/**
 * Normalize device telemetry into canonical Metric format.
 * Supports multiple device adapters: Apple Watch, WHOOP, Catapult, GPS, etc.
 */
export function normalizeMetricRecord(
  input: Record<string, unknown>,
): NormalizedMetric {
  return {
    source: String(input.source ?? 'unknown'),
    sourceDevice: String(input.sourceDevice ?? 'unknown'),
    athleteId: String(input.athleteId ?? 'unknown'),
    type: String(input.type ?? 'unknown'),
    value: Number(input.value ?? 0),
    unit: String(input.unit ?? 'raw'),
    timestamp: new Date(String(input.timestamp ?? new Date().toISOString())),
    qualityScore: Number(input.qualityScore ?? 0.8),
    metadata: input.metadata instanceof Object ? input.metadata : {},
  };
}

/**
 * Apple Watch adapter: map HealthKit samples to canonical metrics.
 */
export function mapAppleWatchToMetrics(
  data: Record<string, unknown>,
): NormalizedMetric[] {
  const metrics: NormalizedMetric[] = [];

  if (typeof data.heartRate === 'number') {
    metrics.push({
      source: 'apple-watch',
      sourceDevice: String(data.deviceId ?? 'unknown'),
      athleteId: String(data.athleteId ?? 'unknown'),
      type: 'heart-rate',
      value: data.heartRate,
      unit: 'bpm',
      timestamp: new Date(),
      qualityScore: 0.95,
      metadata: { source: 'HealthKit' },
    });
  }

  if (typeof data.heartRateVariability === 'number') {
    metrics.push({
      source: 'apple-watch',
      sourceDevice: String(data.deviceId ?? 'unknown'),
      athleteId: String(data.athleteId ?? 'unknown'),
      type: 'hrv',
      value: data.heartRateVariability,
      unit: 'ms',
      timestamp: new Date(),
      qualityScore: 0.92,
      metadata: { source: 'HealthKit' },
    });
  }

  if (typeof data.vo2Max === 'number') {
    metrics.push({
      source: 'apple-watch',
      sourceDevice: String(data.deviceId ?? 'unknown'),
      athleteId: String(data.athleteId ?? 'unknown'),
      type: 'vo2-max',
      value: data.vo2Max,
      unit: 'ml/kg/min',
      timestamp: new Date(),
      qualityScore: 0.88,
      metadata: { source: 'HealthKit' },
    });
  }

  return metrics;
}

/**
 * WHOOP adapter: map WHOOP API payload to canonical metrics.
 */
export function mapWhoopToMetrics(
  data: Record<string, unknown>,
): NormalizedMetric[] {
  const metrics: NormalizedMetric[] = [];

  if (typeof data.readiness === 'number') {
    metrics.push({
      source: 'whoop',
      sourceDevice: String(data.deviceId ?? 'whoop-band'),
      athleteId: String(data.athleteId ?? 'unknown'),
      type: 'readiness',
      value: data.readiness,
      unit: 'score',
      timestamp: new Date(),
      qualityScore: 0.98,
      metadata: { source: 'WHOOP API v2' },
    });
  }

  if (typeof data.recoveryScore === 'number') {
    metrics.push({
      source: 'whoop',
      sourceDevice: String(data.deviceId ?? 'whoop-band'),
      athleteId: String(data.athleteId ?? 'unknown'),
      type: 'recovery',
      value: data.recoveryScore,
      unit: 'score',
      timestamp: new Date(),
      qualityScore: 0.98,
      metadata: { source: 'WHOOP API v2' },
    });
  }

  if (typeof data.strain === 'number') {
    metrics.push({
      source: 'whoop',
      sourceDevice: String(data.deviceId ?? 'whoop-band'),
      athleteId: String(data.athleteId ?? 'unknown'),
      type: 'strain',
      value: data.strain,
      unit: 'score',
      timestamp: new Date(),
      qualityScore: 0.98,
      metadata: { source: 'WHOOP API v2' },
    });
  }

  return metrics;
}

/**
 * Validate metric for ingestion pipeline.
 * Ensures quality and completeness.
 */
export function validateMetric(metric: NormalizedMetric): boolean {
  return (
    metric.athleteId &&
    metric.type &&
    metric.value >= 0 &&
    metric.qualityScore >= 0.7 &&
    metric.timestamp instanceof Date
  );
}
