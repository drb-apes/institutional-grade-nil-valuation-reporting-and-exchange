import { query } from '../db/index.js';
import type { AthleteTelemetry } from '@ig-nil/shared';

export async function getLatestTelemetry(
  athleteId: string,
): Promise<AthleteTelemetry | null> {
  const result = await query(
    `
    SELECT
      athlete_id,
      heart_rate_variability,
      readiness,
      explosive_output,
      fatigue,
      recovery,
      engagement_velocity,
      latency_ms,
      timestamp
    FROM athlete_telemetry
    WHERE athlete_id = $1
    ORDER BY timestamp DESC
    LIMIT 1
    `,
    [athleteId],
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    athleteId: row.athlete_id,
    heartRateVariability: Number(row.heart_rate_variability),
    readiness: Number(row.readiness),
    explosiveOutput: Number(row.explosive_output),
    fatigue: Number(row.fatigue),
    recovery: Number(row.recovery),
    engagementVelocity: Number(row.engagement_velocity),
    latency: Number(row.latency_ms),
    timestamp: new Date(row.timestamp),
  };
}

export async function recordTelemetry(
  athleteId: string,
  data: Partial<AthleteTelemetry>,
) {
  const result = await query(
    `
    INSERT INTO athlete_telemetry (
      athlete_id,
      heart_rate_variability,
      readiness,
      explosive_output,
      fatigue,
      recovery,
      engagement_velocity,
      latency_ms,
      timestamp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
    `,
    [
      athleteId,
      data.heartRateVariability,
      data.readiness,
      data.explosiveOutput,
      data.fatigue,
      data.recovery,
      data.engagementVelocity,
      data.latency,
      data.timestamp || new Date(),
    ],
  );

  return result.rows[0];
}
