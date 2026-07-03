import type { Campaign } from './types';
import { sampleCampaigns } from './data/sampleCampaigns';

const KEY = 'campaign-monitoring:campaigns';

export function loadCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return sampleCampaigns;
    const parsed = JSON.parse(raw) as Campaign[];
    return Array.isArray(parsed) ? parsed : sampleCampaigns;
  } catch {
    return sampleCampaigns;
  }
}

export function saveCampaigns(campaigns: Campaign[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(campaigns));
  } catch {
    // storage full / unavailable — ignore, in-memory state still works
  }
}

/** Small id helper that works everywhere modern browsers do. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.floor(
    performance.now() * 1000,
  ).toString(36)}`;
}
