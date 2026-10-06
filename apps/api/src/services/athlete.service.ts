import { query } from '../db/index.js';
import type { AthleteProfile } from '@ig-nil/shared';

export async function getAthleteProfile(
  athleteId: string,
): Promise<AthleteProfile | null> {
  const result = await query(
    `
    SELECT
      id,
      name,
      team,
      position,
      base_value,
      performance_score AS performance,
      sponsorship_fit,
      media_velocity,
      social_demand,
      biometric_stability,
      fatigue_penalty,
      risk_discount,
      volatility_penalty,
      created_at,
      updated_at
    FROM athletes
    WHERE id = $1 AND deleted_at IS NULL
    `,
    [athleteId],
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    position: row.position,
    baseValue: Number(row.base_value),
    performance: Number(row.performance),
    sponsorshipFit: Number(row.sponsorship_fit),
    mediaVelocity: Number(row.media_velocity),
    socialDemand: Number(row.social_demand),
    biometricStability: Number(row.biometric_stability),
    fatiguePenalty: Number(row.fatigue_penalty),
    riskDiscount: Number(row.risk_discount),
    volatilityPenalty: Number(row.volatility_penalty),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function createAthlete(
  name: string,
  team: string,
  position: string,
  baseValue: number,
): Promise<AthleteProfile> {
  const result = await query(
    `
    INSERT INTO athletes (name, team, position, base_value)
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      name,
      team,
      position,
      base_value,
      performance_score AS performance,
      sponsorship_fit,
      media_velocity,
      social_demand,
      biometric_stability,
      fatigue_penalty,
      risk_discount,
      volatility_penalty,
      created_at,
      updated_at
    `,
    [name, team, position, baseValue],
  );

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    position: row.position,
    baseValue: Number(row.base_value),
    performance: Number(row.performance),
    sponsorshipFit: Number(row.sponsorship_fit),
    mediaVelocity: Number(row.media_velocity),
    socialDemand: Number(row.social_demand),
    biometricStability: Number(row.biometric_stability),
    fatiguePenalty: Number(row.fatigue_penalty),
    riskDiscount: Number(row.risk_discount),
    volatilityPenalty: Number(row.volatility_penalty),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function listAthletes(limit = 50, offset = 0) {
  const result = await query(
    `
    SELECT
      id,
      name,
      team,
      position,
      base_value,
      performance_score AS performance,
      sponsorship_fit,
      created_at
    FROM athletes
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    team: row.team,
    position: row.position,
    baseValue: Number(row.base_value),
    performance: Number(row.performance),
    sponsorshipFit: Number(row.sponsorship_fit),
  }));
}
