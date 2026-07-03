import type { Campaign } from '../types';

// Reference campaign taken from the Fresh & Soft report card.
export const sampleCampaigns: Campaign[] = [
  {
    id: 'fresh-soft-gala-2026',
    name: 'Fresh & Soft — Welcome Gala 2026',
    brand: 'Far East Fame Line',
    productLine: 'Fresh & Soft',
    periodStart: '2026-03-09',
    periodEnd: '2026-04-09',
    createdAt: '2026-03-08T09:00:00.000Z',
    hashtags: [
      '#ให้ชีวิตคุณและลูกหมุนไปพร้อมกัน',
      'freshsoft+premium+organic',
      'freshsoftorganic',
      'เฟรชแอนด์ซอฟท์+พรีเมียม',
    ],
    channels: [
      {
        id: 'fresh-soft-yt-prog',
        channel: 'YOUTUBE ADS – PROGRAMMATIC',
        budgetTHB: 300_000,
        kpiValue: 1_960_784,
        kpiUnit: 'IMPs',
        material: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        format: 'VDO 15S NON-SKIPPABLE',
        demographic: 'BOTH SEX 25-44, TH',
        targeting: [
          'AFFINITY',
          'CUSTOM AFFINITY',
          'CUSTOM INTENT',
          'IN-MARKET',
          'CONTEXTUAL CHANNELS',
        ],
        metrics: {
          impressions: 1_976_979,
          reach: 1_737_402,
          clicks: 5_138,
          engagement: 12_847,
          frequency: 1.2,
          vdoPlayed25: 93.48,
          vdoPlayed50: 90.9,
          vdoPlayed75: 89.14,
          vdoPlayed100: 87.91,
        },
      },
    ],
  },
];
