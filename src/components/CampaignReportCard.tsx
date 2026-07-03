import { useState } from 'react';
import type { Campaign, ChannelPlan } from '../types';
import { emptyMetrics } from '../types';
import {
  computeAnalytics,
  fmtInt,
  fmtMoney,
  fmtPct,
  fmtPeriod,
} from '../analytics';
import { MetricTile } from './MetricTile';
import { isUrl, shortUrl, youtubeThumb } from '../media';

interface Props {
  campaign: Campaign;
  channel: ChannelPlan;
}

export function CampaignReportCard({ campaign: c, channel: ch }: Props) {
  const a = computeAnalytics(ch);
  const m = ch.metrics ?? emptyMetrics();
  const [thumbFailed, setThumbFailed] = useState(false);
  const thumb = youtubeThumb(ch.material);
  const materialIsUrl = isUrl(ch.material);
  const showThumb = thumb && !thumbFailed;

  return (
    <article className="report-card">
      <header className="report-card__head">
        <div className="report-card__title-block">
          <h1 className="report-card__title">{ch.channel}</h1>
          <p className="report-card__period">
            Period : {fmtPeriod(c.periodStart, c.periodEnd)}
          </p>
        </div>
        {c.brand && <div className="report-card__brand">{c.brand}</div>}
      </header>

      <div className="report-card__body">
        {/* Left: creative + channel spec */}
        <section className="report-card__left">
          {showThumb ? (
            <a
              className="creative-preview creative-preview--media"
              href={ch.material}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={thumb}
                alt="Material preview"
                loading="lazy"
                onError={() => setThumbFailed(true)}
              />
              {c.productLine && (
                <span className="creative-preview__badge">{c.productLine}</span>
              )}
              <span className="creative-preview__play">▶</span>
            </a>
          ) : (
            <div className="creative-preview">
              {c.productLine && (
                <span className="creative-preview__badge">{c.productLine}</span>
              )}
              <span className="creative-preview__hint">
                {materialIsUrl ? 'เปิด Material' : 'Creative preview'}
              </span>
            </div>
          )}

          <dl className="spec">
            <div className="spec__row">
              <dt>MATERIAL</dt>
              <dd>
                {materialIsUrl ? (
                  <a
                    className="link"
                    href={ch.material}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortUrl(ch.material)}
                  </a>
                ) : (
                  ch.material || '—'
                )}
              </dd>
            </div>
            <div className="spec__row">
              <dt>FORMAT</dt>
              <dd>{ch.format || '—'}</dd>
            </div>
            <div className="spec__row">
              <dt>DEMO</dt>
              <dd>{ch.demographic || '—'}</dd>
            </div>
            <div className="spec__row">
              <dt>TARGETING</dt>
              <dd>{ch.targeting?.length ? ch.targeting.join(', ') : '—'}</dd>
            </div>
            {ch.details && (
              <div className="spec__row">
                <dt>รายละเอียด</dt>
                <dd>{ch.details}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Right: KPI + metric grid */}
        <section className="report-card__right">
          <div className="kpi-banner">
            <span className="kpi-banner__label">KPI :</span>
            <span className="kpi-banner__value">
              {fmtInt(ch.kpiValue)} {ch.kpiUnit}
            </span>
            <span
              className={`kpi-banner__chip ${
                a.kpiMet ? 'kpi-banner__chip--ok' : 'kpi-banner__chip--under'
              }`}
            >
              {fmtPct(a.kpiAchievement, 1)} {a.kpiMet ? '✓' : '↓'}
            </span>
          </div>

          <div className="metric-grid">
                <MetricTile
                  label="Impression"
                  value={fmtInt(m.impressions)}
                  variant="orange"
                  size="lg"
                />
                <MetricTile label="Reach" value={fmtInt(m.reach)} size="lg" />

                <MetricTile label="Click" value={fmtInt(m.clicks)} />
                <MetricTile label="CTR%" value={fmtPct(a.ctr)} />

                <MetricTile label="Engagement" value={fmtInt(m.engagement)} />
                <MetricTile
                  label="Eng. Rate%"
                  value={fmtPct(a.engagementRate)}
                />

                <MetricTile label="Frequency" value={m.frequency.toFixed(2)} />
                <MetricTile
                  label="Budget"
                  value={`${fmtMoney(ch.budgetTHB)}.- THB`}
                />

                <MetricTile
                  label="VDO Played To 25%"
                  value={fmtPct(m.vdoPlayed25)}
                />
                <MetricTile
                  label="VDO Played To 50%"
                  value={fmtPct(m.vdoPlayed50)}
                />

                <MetricTile
                  label="VDO Played To 75%"
                  value={fmtPct(m.vdoPlayed75)}
                />
                <MetricTile
                  label="VDO Played To 100%"
                  value={fmtPct(m.vdoPlayed100)}
                />
          </div>

          {/* Analysis strip — monitoring value-add beyond the raw report */}
          <div className="analysis">
            <div className="analysis__item">
              <span className="analysis__label">CPM</span>
              <span className="analysis__value">{fmtMoney(a.cpm, 2)} ฿</span>
            </div>
            <div className="analysis__item">
              <span className="analysis__label">CPV</span>
              <span className="analysis__value">{fmtMoney(a.cpv, 3)} ฿</span>
            </div>
            <div className="analysis__item">
              <span className="analysis__label">CPCV</span>
              <span className="analysis__value">{fmtMoney(a.cpcv, 3)} ฿</span>
            </div>
            <div className="analysis__item">
              <span className="analysis__label">CPC</span>
              <span className="analysis__value">{fmtMoney(a.cpc, 2)} ฿</span>
            </div>
            <div className="analysis__item">
              <span className="analysis__label">KPI Achieved</span>
              <span
                className={`analysis__value ${
                  a.kpiMet ? 'analysis__value--ok' : 'analysis__value--under'
                }`}
              >
                {fmtPct(a.kpiAchievement, 1)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
