import { useState } from 'react';
import type { Campaign } from '../types';
import { fmtMoney, fmtPeriod, totalBudget } from '../analytics';
import { fetchCampaignData, DATA_SOURCE } from '../api/googleAds';
import { CampaignReportCard } from './CampaignReportCard';
import { CampaignCharts } from './CampaignCharts';

interface Props {
  campaign: Campaign;
  onBack: () => void;
  onEdit: () => void;
  onUpdate: (c: Campaign) => void;
}

export function CampaignDetail({ campaign: c, onBack, onEdit, onUpdate }: Props) {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const lastSync = c.channels.find((ch) => ch.lastSync)?.lastSync;

  const handleGetData = async () => {
    setFetching(true);
    setError('');
    try {
      const updated = await fetchCampaignData(c);
      onUpdate(updated);
    } catch {
      setError('ดึงข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="detail">
      <div className="detail__head">
        <button className="btn btn--ghost" onClick={onBack}>
          ← Campaigns
        </button>
        <div className="detail__head-actions">
          <button
            className="btn btn--primary"
            onClick={handleGetData}
            disabled={fetching}
          >
            {fetching ? (
              <>
                <span className="spinner" /> กำลังดึงข้อมูล…
              </>
            ) : (
              '↻ Get Data'
            )}
          </button>
          <button className="btn btn--ghost" onClick={onEdit} disabled={fetching}>
            ✎ แก้ไข
          </button>
        </div>
      </div>

      <div className="detail__summary">
        <div>
          <h1 className="detail__name">{c.name}</h1>
          <p className="detail__meta">
            {[c.brand, c.productLine].filter(Boolean).join(' · ')} ·{' '}
            {fmtPeriod(c.periodStart, c.periodEnd)}
          </p>
          <p className="detail__source">
            {lastSync ? (
              <>
                <span className="dot dot--live" /> ข้อมูลล่าสุด:{' '}
                {new Date(lastSync.fetchedAt).toLocaleString('th-TH')} ·{' '}
                {lastSync.source === 'mock'
                  ? 'ข้อมูลจำลอง (mock)'
                  : 'Google Ads'}
              </>
            ) : (
              <>
                <span className="dot" /> ยังไม่ได้ดึงข้อมูล — กด “Get Data”
                {DATA_SOURCE === 'mock' && ' (ตอนนี้เป็นข้อมูลจำลอง)'}
              </>
            )}
          </p>
        </div>
        <div className="detail__budget">
          <span className="stat__label">Total Budget</span>
          <span className="detail__budget-value">
            {fmtMoney(totalBudget(c))} ฿
          </span>
        </div>
      </div>

      {error && <p className="form__error">{error}</p>}

      <CampaignCharts campaign={c} />

      <div className="detail__cards">
        {c.channels.map((ch) => (
          <CampaignReportCard key={ch.id} campaign={c} channel={ch} />
        ))}
        {c.channels.length === 0 && (
          <p className="muted">campaign นี้ยังไม่มี channel</p>
        )}
      </div>
    </div>
  );
}
