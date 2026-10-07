const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function fetchTrackA(athleteId: number) {
  const response = await fetch(`${API_BASE_URL}/api/v1/track-a/athletes/${athleteId}/divergence`);
  if (!response.ok) {
    throw new Error('Failed to fetch track A data');
  }
  return response.json();
}

export async function fetchTrackB(campaignId: number) {
  const response = await fetch(`${API_BASE_URL}/api/v1/track-b/campaigns/${campaignId}/summary`);
  if (!response.ok) {
    throw new Error('Failed to fetch track B data');
  }
  return response.json();
}
