import type { Campaign } from '../types';

// ---------------------------------------------------------------------------
// Social-listening time series (engagements / messages per hashtag per day).
//
// No live social-listening account is connected, so this is SIMULATED data.
// It is generated deterministically from the campaign id + hashtag so the
// charts stay stable across re-renders (no flicker) instead of using
// Math.random(). Swap `buildSeries` for a real API when available.
// ---------------------------------------------------------------------------

/** Categorical palette for hashtag series — distinguishable, lightly muted. */
export const SERIES_COLORS = [
  '#3b82c4', // blue
  '#e8734a', // coral
  '#3fae8f', // teal-green
  '#8b6fc4', // violet
  '#d4a017', // amber
  '#c44d8a', // magenta
];

export interface DayPoint {
  /** ISO date for the day. */
  date: string;
  /** Short label e.g. "Mar 16". */
  label: string;
  /** One numeric field per hashtag (keyed by hashtag). */
  [hashtag: string]: number | string;
}

export interface CampaignSeries {
  hashtags: string[];
  engagements: DayPoint[];
  messages: DayPoint[];
}

// --- seeded RNG (xmur3 + mulberry32) ---
function seedFrom(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dayList(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  // guard against absurd ranges
  let guard = 0;
  while (d <= last && guard < 400) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return days;
}

const fmtDay = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/** Gaussian-ish bump centered on `center` day index with given width & height. */
function bump(i: number, center: number, width: number, height: number): number {
  const x = (i - center) / width;
  return height * Math.exp(-x * x);
}

/**
 * Build one metric's series for all hashtags.
 * peakScale controls the vertical magnitude (engagements >> messages).
 */
function buildMetric(
  campaign: Campaign,
  days: Date[],
  hashtags: string[],
  metricKey: string,
  peakScale: number,
): DayPoint[] {
  const n = days.length;
  // Per-hashtag peak plan (deterministic).
  const plans = hashtags.map((tag, idx) => {
    const rng = seedFrom(`${campaign.id}|${tag}|${metricKey}`);
    const peakCount = 1 + Math.floor(rng() * 3); // 1–3 peaks
    const peaks = Array.from({ length: peakCount }, () => ({
      center: Math.floor(rng() * n),
      width: 1.1 + rng() * 2.4,
      height: peakScale * (0.35 + rng() * 0.9) * (idx === 0 ? 1.15 : 1),
    }));
    const baseline = peakScale * 0.01 * rng();
    return { rng, peaks, baseline };
  });

  return days.map((d, i) => {
    const point: DayPoint = { date: d.toISOString().slice(0, 10), label: fmtDay(d) };
    hashtags.forEach((tag, idx) => {
      const { peaks, baseline, rng } = plans[idx];
      let v = baseline + rng() * peakScale * 0.02; // light noise
      for (const p of peaks) v += bump(i, p.center, p.width, p.height);
      point[tag] = Math.max(0, Math.round(v));
    });
    return point;
  });
}

/** Default hashtags when a campaign has none set. */
export function defaultHashtags(c: Campaign): string[] {
  const base = c.productLine || c.brand || 'campaign';
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return [`#${slug}`, `${slug}+premium+organic`, `${slug}organic`];
}

export function buildSeries(campaign: Campaign): CampaignSeries {
  const start = campaign.periodStart
    ? new Date(campaign.periodStart)
    : new Date(campaign.createdAt);
  const end = campaign.periodEnd
    ? new Date(campaign.periodEnd)
    : new Date(start.getTime() + 30 * 864e5);

  const days = dayList(start, end);
  const hashtags =
    campaign.hashtags && campaign.hashtags.length
      ? campaign.hashtags
      : defaultHashtags(campaign);

  // Scale engagement peaks off the campaign's total engagement (fallback const).
  const totalEng = campaign.channels.reduce(
    (s, ch) => s + (ch.metrics?.engagement ?? 0),
    0,
  );
  const engScale = totalEng > 0 ? totalEng / 2.2 : 120_000;

  return {
    hashtags,
    engagements: buildMetric(campaign, days, hashtags, 'eng', engScale),
    messages: buildMetric(campaign, days, hashtags, 'msg', 30),
  };
}
