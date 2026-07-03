import { useState } from 'react';
import type { Campaign, ChannelPlan, CampaignChannel, KpiUnit } from '../types';
import { CHANNEL_OPTIONS, KPI_UNITS } from '../types';
import { newId } from '../storage';

interface Props {
  /** When provided, the form edits this campaign instead of creating a new one. */
  initial?: Campaign;
  onSave: (c: Campaign) => void;
  onCancel: () => void;
}

interface ChannelDraft {
  id: string;
  channel: CampaignChannel;
  budgetTHB: string;
  kpiValue: string;
  kpiUnit: KpiUnit;
  material: string;
  format: string;
  demographic: string;
  targeting: string; // comma-separated
  // metrics (blank → 0)
  impressions: string;
  reach: string;
  clicks: string;
  engagement: string;
  frequency: string;
  vdoPlayed25: string;
  vdoPlayed50: string;
  vdoPlayed75: string;
  vdoPlayed100: string;
}

function blankChannel(): ChannelDraft {
  return {
    id: newId(),
    channel: 'YOUTUBE ADS – PROGRAMMATIC',
    budgetTHB: '',
    kpiValue: '',
    kpiUnit: 'IMPs',
    material: '',
    format: '',
    demographic: '',
    targeting: '',
    impressions: '',
    reach: '',
    clicks: '',
    engagement: '',
    frequency: '',
    vdoPlayed25: '',
    vdoPlayed50: '',
    vdoPlayed75: '',
    vdoPlayed100: '',
  };
}

const numStr = (n: number | undefined): string =>
  n === undefined || n === null ? '' : String(n);

function toDraft(ch: ChannelPlan): ChannelDraft {
  const m = ch.metrics;
  return {
    id: ch.id,
    channel: ch.channel,
    budgetTHB: numStr(ch.budgetTHB),
    kpiValue: numStr(ch.kpiValue),
    kpiUnit: ch.kpiUnit,
    material: ch.material,
    format: ch.format ?? '',
    demographic: ch.demographic ?? '',
    targeting: ch.targeting?.join(', ') ?? '',
    impressions: numStr(m?.impressions),
    reach: numStr(m?.reach),
    clicks: numStr(m?.clicks),
    engagement: numStr(m?.engagement),
    frequency: numStr(m?.frequency),
    vdoPlayed25: numStr(m?.vdoPlayed25),
    vdoPlayed50: numStr(m?.vdoPlayed50),
    vdoPlayed75: numStr(m?.vdoPlayed75),
    vdoPlayed100: numStr(m?.vdoPlayed100),
  };
}

export function CampaignForm({ initial, onSave, onCancel }: Props) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [productLine, setProductLine] = useState(initial?.productLine ?? '');
  const [periodStart, setPeriodStart] = useState(initial?.periodStart ?? '');
  const [periodEnd, setPeriodEnd] = useState(initial?.periodEnd ?? '');
  const [hashtags, setHashtags] = useState(initial?.hashtags?.join(', ') ?? '');
  const [channels, setChannels] = useState<ChannelDraft[]>(
    initial && initial.channels.length
      ? initial.channels.map(toDraft)
      : [blankChannel()],
  );
  const [error, setError] = useState('');

  const updateChannel = (id: string, patch: Partial<ChannelDraft>) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, ...patch } : ch)),
    );
  };

  const addChannel = () => setChannels((prev) => [...prev, blankChannel()]);

  const removeChannel = (id: string) =>
    setChannels((prev) => prev.filter((ch) => ch.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณากรอกชื่อ Campaign');
      return;
    }
    if (channels.length === 0) {
      setError('ต้องมีอย่างน้อย 1 channel');
      return;
    }

    const num = (s: string) => Number(s) || 0;
    const channelPlans: ChannelPlan[] = channels.map((ch) => ({
      id: ch.id,
      channel: ch.channel,
      budgetTHB: num(ch.budgetTHB),
      kpiValue: num(ch.kpiValue),
      kpiUnit: ch.kpiUnit,
      material: ch.material.trim(),
      format: ch.format.trim() || undefined,
      demographic: ch.demographic.trim() || undefined,
      targeting: ch.targeting
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      // blank metric fields become 0 so the report card always shows a value
      metrics: {
        impressions: num(ch.impressions),
        reach: num(ch.reach),
        clicks: num(ch.clicks),
        engagement: num(ch.engagement),
        frequency: num(ch.frequency),
        vdoPlayed25: num(ch.vdoPlayed25),
        vdoPlayed50: num(ch.vdoPlayed50),
        vdoPlayed75: num(ch.vdoPlayed75),
        vdoPlayed100: num(ch.vdoPlayed100),
      },
    }));

    onSave({
      id: initial?.id ?? newId(),
      name: name.trim(),
      brand: brand.trim() || undefined,
      productLine: productLine.trim() || undefined,
      periodStart: periodStart || undefined,
      periodEnd: periodEnd || undefined,
      hashtags: hashtags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      channels: channelPlans,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__head">
        <h1 className="form__title">
          {isEdit ? 'Edit Campaign' : 'New Campaign'}
        </h1>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          ← Back
        </button>
      </div>

      <section className="form__section">
        <h2 className="form__section-title">รายละเอียด Campaign</h2>
        <div className="field">
          <label>ชื่อ Campaign *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น Fresh & Soft — Welcome Gala 2026"
            autoFocus
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>แบรนด์</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Far East Fame Line"
            />
          </div>
          <div className="field">
            <label>Product Line</label>
            <input
              value={productLine}
              onChange={(e) => setProductLine(e.target.value)}
              placeholder="Fresh & Soft"
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>เริ่ม</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div className="field">
            <label>สิ้นสุด</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>Hashtags / Keywords (คั่นด้วย ,)</label>
          <input
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#แคมเปญ, brand+premium, brandorganic"
          />
          <span className="field__hint">
            ใช้เป็นเส้นในกราฟ By Engagements / By Messages
          </span>
        </div>
      </section>

      <section className="form__section">
        <div className="form__section-head">
          <h2 className="form__section-title">Channels</h2>
          <button type="button" className="btn btn--sm" onClick={addChannel}>
            + เพิ่ม Channel
          </button>
        </div>

        {channels.map((ch, i) => (
          <div key={ch.id} className="channel-row">
            <div className="channel-row__head">
              <span className="channel-row__idx">
                #{i + 1}
                {Number(ch.impressions) > 0 && (
                  <span className="channel-row__tag">มีผลแล้ว</span>
                )}
              </span>
              {channels.length > 1 && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => removeChannel(ch.id)}
                >
                  ✕ ลบ
                </button>
              )}
            </div>
            <div className="field">
              <label>Channel</label>
              <select
                value={ch.channel}
                onChange={(e) =>
                  updateChannel(ch.id, {
                    channel: e.target.value as CampaignChannel,
                  })
                }
              >
                {CHANNEL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Budget (THB)</label>
                <input
                  type="number"
                  min="0"
                  value={ch.budgetTHB}
                  onChange={(e) =>
                    updateChannel(ch.id, { budgetTHB: e.target.value })
                  }
                  placeholder="300000"
                />
              </div>
              <div className="field">
                <label>KPI</label>
                <input
                  type="number"
                  min="0"
                  value={ch.kpiValue}
                  onChange={(e) =>
                    updateChannel(ch.id, { kpiValue: e.target.value })
                  }
                  placeholder="1960784"
                />
              </div>
              <div className="field field--unit">
                <label>หน่วย</label>
                <select
                  value={ch.kpiUnit}
                  onChange={(e) =>
                    updateChannel(ch.id, {
                      kpiUnit: e.target.value as KpiUnit,
                    })
                  }
                >
                  {KPI_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Material URL</label>
              <input
                type="url"
                inputMode="url"
                value={ch.material}
                onChange={(e) =>
                  updateChannel(ch.id, { material: e.target.value })
                }
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Format</label>
                <input
                  value={ch.format}
                  onChange={(e) =>
                    updateChannel(ch.id, { format: e.target.value })
                  }
                  placeholder="VDO 15S NON-SKIPPABLE"
                />
              </div>
              <div className="field">
                <label>Demographic</label>
                <input
                  value={ch.demographic}
                  onChange={(e) =>
                    updateChannel(ch.id, { demographic: e.target.value })
                  }
                  placeholder="BOTH SEX 25-44, TH"
                />
              </div>
            </div>
            <div className="field">
              <label>Targeting (คั่นด้วย ,)</label>
              <input
                value={ch.targeting}
                onChange={(e) =>
                  updateChannel(ch.id, { targeting: e.target.value })
                }
                placeholder="AFFINITY, CUSTOM AFFINITY, IN-MARKET"
              />
            </div>

            <details className="metrics-fold" open={Number(ch.impressions) > 0}>
              <summary>ผลลัพธ์ (Metrics) — ไม่กรอก = 0</summary>
              <div className="field-row">
                <div className="field">
                  <label>Impression</label>
                  <input
                    type="number"
                    min="0"
                    value={ch.impressions}
                    onChange={(e) =>
                      updateChannel(ch.id, { impressions: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="field">
                  <label>Reach</label>
                  <input
                    type="number"
                    min="0"
                    value={ch.reach}
                    onChange={(e) =>
                      updateChannel(ch.id, { reach: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Click</label>
                  <input
                    type="number"
                    min="0"
                    value={ch.clicks}
                    onChange={(e) =>
                      updateChannel(ch.id, { clicks: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="field">
                  <label>Engagement</label>
                  <input
                    type="number"
                    min="0"
                    value={ch.engagement}
                    onChange={(e) =>
                      updateChannel(ch.id, { engagement: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Frequency</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ch.frequency}
                    onChange={(e) =>
                      updateChannel(ch.id, { frequency: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>VDO 25%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={ch.vdoPlayed25}
                    onChange={(e) =>
                      updateChannel(ch.id, { vdoPlayed25: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="field">
                  <label>VDO 50%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={ch.vdoPlayed50}
                    onChange={(e) =>
                      updateChannel(ch.id, { vdoPlayed50: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>VDO 75%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={ch.vdoPlayed75}
                    onChange={(e) =>
                      updateChannel(ch.id, { vdoPlayed75: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="field">
                  <label>VDO 100%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={ch.vdoPlayed100}
                    onChange={(e) =>
                      updateChannel(ch.id, { vdoPlayed100: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </details>
          </div>
        ))}
      </section>

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          ยกเลิก
        </button>
        <button type="submit" className="btn btn--primary">
          {isEdit ? 'บันทึกการแก้ไข' : 'บันทึก Campaign'}
        </button>
      </div>
    </form>
  );
}
