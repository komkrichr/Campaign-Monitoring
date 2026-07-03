import type { Campaign, ChannelPlan } from './types';
import { emptyMetrics } from './types';

/** Derived analytics computed from a channel's raw metrics. */
export interface CampaignAnalytics {
  /** Click-through rate %. */
  ctr: number;
  /** Engagement rate % (engagements / impressions). */
  engagementRate: number;
  /** KPI achievement % (delivered vs KPI target, unit-aware). */
  kpiAchievement: number;
  /** The delivered value compared against the KPI target. */
  delivered: number;
  /** Cost per 1,000 impressions (THB). */
  cpm: number;
  /** Cost per view (THB). Non-skippable served impression ≈ a view. */
  cpv: number;
  /** Cost per completed view — played to 100% (THB). */
  cpcv: number;
  /** Cost per click (THB). */
  cpc: number;
  /** Completed views (impressions × played-to-100%). */
  completedViews: number;
  /** Verdict on whether the KPI target was met. */
  kpiMet: boolean;
}

/** The metric that the KPI target is measured against, based on unit. */
function deliveredForKpi(ch: ChannelPlan): number {
  const m = ch.metrics;
  if (!m) return 0;
  switch (ch.kpiUnit) {
    case 'Clicks':
      return m.clicks;
    case 'Reach':
      return m.reach;
    case 'Views':
      return m.impressions * (m.vdoPlayed100 / 100);
    case 'Engagement':
      return m.engagement;
    case 'IMPs':
    default:
      return m.impressions;
  }
}

export function computeAnalytics(ch: ChannelPlan): CampaignAnalytics {
  const m = ch.metrics ?? emptyMetrics();

  const safeImpr = m.impressions || 0;
  const ctr = safeImpr > 0 ? (m.clicks / safeImpr) * 100 : 0;
  const engagementRate = safeImpr > 0 ? (m.engagement / safeImpr) * 100 : 0;
  const cpm = safeImpr > 0 ? (ch.budgetTHB / safeImpr) * 1000 : 0;
  const cpv = safeImpr > 0 ? ch.budgetTHB / safeImpr : 0;
  const completedViews = safeImpr * (m.vdoPlayed100 / 100);
  const cpcv = completedViews > 0 ? ch.budgetTHB / completedViews : 0;
  const cpc = m.clicks > 0 ? ch.budgetTHB / m.clicks : 0;

  const delivered = deliveredForKpi(ch);
  const kpiAchievement =
    ch.kpiValue > 0 ? (delivered / ch.kpiValue) * 100 : 0;

  return {
    ctr,
    engagementRate,
    kpiAchievement,
    delivered,
    cpm,
    cpv,
    cpcv,
    cpc,
    completedViews,
    kpiMet: delivered >= ch.kpiValue,
  };
}

// ----- campaign-level roll-ups -----

export function totalBudget(c: Campaign): number {
  return c.channels.reduce((sum, ch) => sum + (ch.budgetTHB || 0), 0);
}

export function channelsWithResults(c: Campaign): number {
  return c.channels.filter((ch) => ch.metrics).length;
}

/**
 * Group channels by type with counts, most-frequent first.
 * Accepts channels from one campaign or many (pass a flattened list).
 */
export function channelBreakdown(
  channels: ChannelPlan[],
): { channel: ChannelPlan['channel']; count: number }[] {
  const counts = new Map<ChannelPlan['channel'], number>();
  for (const ch of channels) {
    counts.set(ch.channel, (counts.get(ch.channel) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count || a.channel.localeCompare(b.channel));
}

// ----- formatting helpers -----

export const fmtInt = (n: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

export const fmtPct = (n: number, digits = 2): string =>
  `${n.toFixed(digits)}%`;

export const fmtMoney = (n: number, digits = 0): string =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);

export function fmtPeriod(startISO?: string, endISO?: string): string {
  if (!startISO || !endISO) return '—';
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const start = new Date(startISO);
  const end = new Date(endISO);
  const startStr = start.toLocaleDateString('en-GB', opts);
  const endStr = end.toLocaleDateString('en-GB', opts);
  const yy = `'${String(end.getFullYear()).slice(-2)}`;
  return `${startStr} – ${endStr}${yy}`;
}
