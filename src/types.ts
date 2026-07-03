// Data model for Campaign Monitoring.
// Hierarchy: Campaign (name) → one or more Channels (budget, KPI, material, metrics).

export type CampaignChannel =
  | 'YOUTUBE ADS – PROGRAMMATIC'
  | 'YOUTUBE ADS – TRUEVIEW'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'GOOGLE DISPLAY'
  | 'LINE'
  | 'OTHER';

export const CHANNEL_OPTIONS: CampaignChannel[] = [
  'YOUTUBE ADS – PROGRAMMATIC',
  'YOUTUBE ADS – TRUEVIEW',
  'FACEBOOK',
  'INSTAGRAM',
  'TIKTOK',
  'GOOGLE DISPLAY',
  'LINE',
  'OTHER',
];

/** KPI is expressed as a value + a unit, since channels measure differently. */
export type KpiUnit = 'IMPs' | 'Views' | 'Clicks' | 'Reach' | 'Engagement';

export const KPI_UNITS: KpiUnit[] = [
  'IMPs',
  'Views',
  'Clicks',
  'Reach',
  'Engagement',
];

/** Raw numbers as reported by the ad platform / media agency. */
export interface CampaignMetrics {
  impressions: number;
  reach: number;
  clicks: number;
  engagement: number;
  frequency: number;
  /** Video retention funnel, stored as percentages (e.g. 93.48 = 93.48%). */
  vdoPlayed25: number;
  vdoPlayed50: number;
  vdoPlayed75: number;
  vdoPlayed100: number;
}

/** Zero-filled metrics — used when a channel has no results entered yet. */
export function emptyMetrics(): CampaignMetrics {
  return {
    impressions: 0,
    reach: 0,
    clicks: 0,
    engagement: 0,
    frequency: 0,
    vdoPlayed25: 0,
    vdoPlayed50: 0,
    vdoPlayed75: 0,
    vdoPlayed100: 0,
  };
}

/** When the channel's metrics were last synced (ISO), and from where. */
export interface DataSourceInfo {
  fetchedAt: string;
  source: 'mock' | 'google-ads';
}

/** A single channel within a campaign — the reporting unit. */
export interface ChannelPlan {
  id: string;
  channel: CampaignChannel;
  budgetTHB: number;
  kpiValue: number;
  kpiUnit: KpiUnit;
  /** Material / creative — a URL (e.g. YouTube link to the ad video). */
  material: string;
  format?: string; // "VDO 15S NON-SKIPPABLE"
  demographic?: string; // "BOTH SEX 25-44, TH"
  targeting?: string[]; // ["AFFINITY", ...]
  /** Actual performance — filled in once the campaign is running / done. */
  metrics?: CampaignMetrics;
  /** Set when metrics were pulled from a data source (mock or Google Ads). */
  lastSync?: DataSourceInfo;
}

export interface Campaign {
  id: string;
  name: string;
  brand?: string; // "Far East Fame Line"
  productLine?: string; // "Fresh & Soft"
  periodStart?: string; // ISO date "2026-03-09"
  periodEnd?: string; // ISO date "2026-04-09"
  /** Hashtags / keywords tracked for social listening (chart series). */
  hashtags?: string[];
  channels: ChannelPlan[];
  createdAt: string; // ISO timestamp
}
