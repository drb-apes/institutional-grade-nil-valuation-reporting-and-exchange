import { query } from '../db/index.js';
import type { Campaign } from '@ig-nil/shared';

export async function getCampaign(campaignId: string): Promise<Campaign | null> {
  const result = await query(
    `
    SELECT
      id,
      sponsor_id,
      sponsor_name,
      principal,
      revenue_sweep_percent,
      risk_profile,
      active_tranches,
      capital_secured,
      created_at,
      updated_at
    FROM campaigns
    WHERE id = $1
    `,
    [campaignId],
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    sponsorId: row.sponsor_id,
    sponsorName: row.sponsor_name,
    principal: Number(row.principal),
    revenueSweepPercent: Number(row.revenue_sweep_percent),
    riskProfile: row.risk_profile,
    activeTranches: row.active_tranches,
    capitalSecured: Number(row.capital_secured),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function createCampaign(
  sponsorId: string,
  sponsorName: string,
  principal: number,
  revenueSweepPercent = 10,
): Promise<Campaign> {
  const result = await query(
    `
    INSERT INTO campaigns (
      sponsor_id,
      sponsor_name,
      principal,
      revenue_sweep_percent
    ) VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      sponsor_id,
      sponsor_name,
      principal,
      revenue_sweep_percent,
      risk_profile,
      active_tranches,
      capital_secured,
      created_at,
      updated_at
    `,
    [sponsorId, sponsorName, principal, revenueSweepPercent],
  );

  const row = result.rows[0];
  return {
    id: row.id,
    sponsorId: row.sponsor_id,
    sponsorName: row.sponsor_name,
    principal: Number(row.principal),
    revenueSweepPercent: Number(row.revenue_sweep_percent),
    riskProfile: row.risk_profile,
    activeTranches: row.active_tranches,
    capitalSecured: Number(row.capital_secured),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function updateCampaignRisk(
  campaignId: string,
  riskProfile: string,
) {
  await query(
    `
    UPDATE campaigns
    SET risk_profile = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    `,
    [campaignId, riskProfile],
  );
}

export async function listCampaigns(limit = 50, offset = 0) {
  const result = await query(
    `
    SELECT
      id,
      sponsor_id,
      sponsor_name,
      principal,
      revenue_sweep_percent,
      risk_profile,
      created_at
    FROM campaigns
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );

  return result.rows.map((row) => ({
    id: row.id,
    sponsorId: row.sponsor_id,
    sponsorName: row.sponsor_name,
    principal: Number(row.principal),
    revenueSweepPercent: Number(row.revenue_sweep_percent),
    riskProfile: row.risk_profile,
  }));
}
