import type { Campaign } from '../types';
import {
  channelBreakdown,
  channelsWithResults,
  fmtMoney,
  fmtPeriod,
  totalBudget,
} from '../analytics';

interface Props {
  campaigns: Campaign[];
  onOpen: (id: string) => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CampaignListPage({
  campaigns,
  onOpen,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="list-page">
      <div className="list-page__head">
        <div>
          <h1 className="list-page__title">Campaigns</h1>
          <p className="list-page__sub">
            {campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}
          </p>
        </div>
        <button className="btn btn--primary" onClick={onCreate}>
          + New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="empty">
          <p>ยังไม่มี campaign — เริ่มสร้างอันแรกได้เลย</p>
          <button className="btn btn--primary" onClick={onCreate}>
            + New Campaign
          </button>
        </div>
      ) : (
        <div className="campaign-cards">
          {campaigns.map((c) => {
            const breakdown = channelBreakdown(c.channels);
            return (
              <div
                key={c.id}
                className="campaign-card"
                onClick={() => onOpen(c.id)}
              >
                <div className="campaign-card__top">
                  <div>
                    <h3 className="campaign-card__name">{c.name}</h3>
                    <p className="campaign-card__meta">
                      {[c.brand, c.productLine].filter(Boolean).join(' · ') ||
                        '—'}
                    </p>
                  </div>
                  <div className="campaign-card__actions">
                    <button
                      className="btn btn--ghost btn--sm"
                      title="แก้ไข campaign"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(c.id);
                      }}
                    >
                      ✎
                    </button>
                    <button
                      className="btn btn--ghost btn--sm"
                      title="ลบ campaign"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`ลบ "${c.name}" ?`)) onDelete(c.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="campaign-card__stats">
                  <div>
                    <span className="stat__label">Period</span>
                    <span className="stat__value">
                      {fmtPeriod(c.periodStart, c.periodEnd)}
                    </span>
                  </div>
                  <div>
                    <span className="stat__label">Channels</span>
                    <span className="stat__value">
                      {c.channels.length}{' '}
                      <small className="muted">
                        ({channelsWithResults(c)} มีผล)
                      </small>
                    </span>
                  </div>
                  <div>
                    <span className="stat__label">Total Budget</span>
                    <span className="stat__value">
                      {fmtMoney(totalBudget(c))} ฿
                    </span>
                  </div>
                </div>

                <div className="channel-chips">
                  {breakdown.map((b) => (
                    <span key={b.channel} className="channel-chip">
                      {b.channel}
                      {b.count > 1 && (
                        <b className="channel-chip__count">×{b.count}</b>
                      )}
                    </span>
                  ))}
                  {c.channels.length === 0 && (
                    <span className="muted">ยังไม่มี channel</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
