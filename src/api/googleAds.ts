import type { Campaign, ChannelPlan, CampaignMetrics } from '../types';

// ---------------------------------------------------------------------------
// Google Ads / YouTube data source.
//
// There is no connected Google Ads account yet, so `fetchChannelMetrics`
// currently returns SIMULATED data. When credentials are available, replace
// the body of `fetchChannelMetrics` with a real API call (keep the signature)
// and flip `source` to 'google-ads'. Everything upstream stays the same.
// ---------------------------------------------------------------------------

export const DATA_SOURCE: 'mock' | 'google-ads' = 'mock';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Random float in [min, max). */
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const jitter = (base: number, pct: number) =>
  base * (1 + rand(-pct, pct));

/**
 * Produce a plausible metrics set from a channel's budget + KPI.
 * Assumes a ~150 THB CPM baseline (typical TH programmatic video).
 */
function simulateMetrics(ch: ChannelPlan): CampaignMetrics {
  // Impressions: anchor to the KPI target if it is in impressions,
  // otherwise derive from budget at a ~150 THB CPM.
  const fromBudget = ch.budgetTHB > 0 ? (ch.budgetTHB / 150) * 1000 : 500_000;
  const base =
    ch.kpiUnit === 'IMPs' && ch.kpiValue > 0 ? ch.kpiValue : fromBudget;
  const impressions = Math.round(jitter(base, 0.06));

  const reachRate = rand(0.82, 0.92);
  const reach = Math.round(impressions * reachRate);
  const frequency = reach > 0 ? impressions / reach : 0;

  const ctr = rand(0.0018, 0.0045); // 0.18% – 0.45%
  const clicks = Math.round(impressions * ctr);

  // Engagement = clicks + light-interactions (hovers, expands, likes...)
  const engagement = Math.round(clicks * rand(1.4, 3.2));

  // Video retention funnel — monotonically decreasing.
  const v25 = rand(90, 95);
  const v50 = v25 - rand(1, 3);
  const v75 = v50 - rand(1, 3);
  const v100 = v75 - rand(1, 3);

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    impressions,
    reach,
    clicks,
    engagement,
    frequency: round2(frequency),
    vdoPlayed25: round2(v25),
    vdoPlayed50: round2(v50),
    vdoPlayed75: round2(v75),
    vdoPlayed100: round2(v100),
  };
}

/** Fetch (currently simulate) live metrics for one channel. */
export async function fetchChannelMetrics(
  ch: ChannelPlan,
): Promise<CampaignMetrics> {
  await wait(500 + Math.random() * 900); // simulate network latency
  return simulateMetrics(ch);
}

/** Fetch metrics for every channel of a campaign and return the updated copy. */
export async function fetchCampaignData(c: Campaign): Promise<Campaign> {
  const fetchedAt = new Date().toISOString();
  const channels = await Promise.all(
    c.channels.map(async (ch) => ({
      ...ch,
      metrics: await fetchChannelMetrics(ch),
      lastSync: { fetchedAt, source: DATA_SOURCE },
    })),
  );
  return { ...c, channels };
}
