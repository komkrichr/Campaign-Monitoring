import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { Campaign } from '../types';
import { buildSeries, SERIES_COLORS } from '../charts/timeseries';
import type { DayPoint } from '../charts/timeseries';

interface Props {
  campaign: Campaign;
}

const kFmt = (n: number): string =>
  n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;

/** Bump a key after the window settles so ResponsiveContainer re-measures. */
function useResizeKey(): number {
  const [key, setKey] = useState(0);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => setKey((k) => k + 1), 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
    };
  }, []);
  return key;
}

interface ChartProps {
  title: string;
  unit: string;
  data: DayPoint[];
  hashtags: string[];
  tickEvery: number;
  resizeKey: number;
}

function TrendChart({
  title,
  unit,
  data,
  hashtags,
  tickEvery,
  resizeKey,
}: ChartProps) {
  const totals = hashtags.map((tag) => ({
    tag,
    total: data.reduce((sum, p) => sum + (Number(p[tag]) || 0), 0),
  }));

  return (
    <div className="chart">
      <span className="chart__title">{title}</span>
      <div className="chart__plot">
        <ResponsiveContainer key={resizeKey} width="100%" height={240}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="var(--hairline)" vertical={false} />
            <XAxis
              dataKey="label"
              interval={tickEvery}
              tick={{ fontSize: 12, fill: 'var(--muted)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--hairline-strong)' }}
              minTickGap={16}
            />
            <YAxis
              width={48}
              tickFormatter={kFmt}
              tick={{ fontSize: 12, fill: 'var(--muted)' }}
              tickLine={false}
              axisLine={false}
              label={{
                value: `amount (${unit})`,
                angle: -90,
                position: 'insideLeft',
                style: {
                  fontSize: 11,
                  fill: 'var(--muted)',
                  textAnchor: 'middle',
                },
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--hairline-strong)',
                fontSize: 12,
                boxShadow: 'var(--shadow-soft)',
              }}
              formatter={(v: unknown) => Number(v).toLocaleString('en-US')}
            />
            {hashtags.map((tag, i) => (
              <Line
                key={tag}
                type="monotone"
                dataKey={tag}
                stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        {totals.map(({ tag, total }, i) => (
          <span key={tag} className="chart-legend__item">
            <span
              className="chart-legend__swatch"
              style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
            />
            <span className="chart-legend__tag">{tag}</span>
            <span className="chart-legend__value">
              : {total.toLocaleString('en-US')}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function CampaignCharts({ campaign }: Props) {
  const series = useMemo(() => buildSeries(campaign), [campaign]);
  const resizeKey = useResizeKey();
  const n = series.engagements.length;
  const tickEvery = Math.max(0, Math.floor(n / 8));

  return (
    <section className="charts">
      <div className="charts__head">
        <h2 className="charts__title">Social Performance Over Time</h2>
        <span className="charts__note">ข้อมูลจำลอง (mock) · รายวันตามช่วง campaign</span>
      </div>

      <TrendChart
        title="BY ENGAGEMENTS"
        unit="engagement"
        data={series.engagements}
        hashtags={series.hashtags}
        tickEvery={tickEvery}
        resizeKey={resizeKey}
      />
      <TrendChart
        title="BY MESSAGES"
        unit="messages"
        data={series.messages}
        hashtags={series.hashtags}
        tickEvery={tickEvery}
        resizeKey={resizeKey}
      />
    </section>
  );
}
