const API_BASE = 'http://localhost:4000/api/v1';

export async function fetchTrackA(athleteId: number) {
  const response = await fetch(`${API_BASE}/track-a/athletes/${athleteId}/divergence`);
  if (!response.ok) {
    throw new Error('Failed to fetch Track A data');
  }
  return response.json();
}

export async function fetchTrackB(campaignId: number) {
  const response = await fetch(`${API_BASE}/track-b/campaigns/${campaignId}/summary`);
  if (!response.ok) {
    throw new Error('Failed to fetch Track B data');
  }
  return response.json();
}
