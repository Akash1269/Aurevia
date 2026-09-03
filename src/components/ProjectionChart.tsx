import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import primitives from '../styles/primitives.module.css'
import { formatCompactInr, formatInr } from '../utils/format'
import styles from './ProjectionChart.module.css'

export interface ProjectionSeriesDef {
  key: string
  label: string
  color: string
}

export interface ProjectionStackPoint {
  label: string
  total: number
  [seriesKey: string]: string | number
}

const tooltipStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10 }
const legendStyle = { color: 'var(--text)', fontSize: 11 }

interface StackTooltipProps {
  active?: boolean
  label?: string
  payload?: { dataKey?: string; value?: number }[]
  series: ProjectionSeriesDef[]
}

function StackTooltip({ active, label, payload, series }: StackTooltipProps) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0)
  const rows = series
    .map((s) => ({ ...s, value: payload.find((p) => p.dataKey === s.key)?.value ?? 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)

  return (
    <div
      style={{
        ...tooltipStyle,
        padding: 'var(--space-3) var(--space-4)',
        color: 'var(--text-h)',
        fontSize: 'var(--text-sm)',
        minWidth: 220,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{label}</div>
      {rows.map((r) => (
        <div
          key={r.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            marginTop: 4,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
            {r.label}
          </span>
          <span style={{ whiteSpace: 'nowrap' }}>
            {formatInr(r.value)} · {total ? Math.round((r.value / total) * 100) : 0}%
          </span>
        </div>
      ))}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          marginTop: 'var(--space-2)',
          paddingTop: 'var(--space-2)',
          fontWeight: 600,
        }}
      >
        Total {formatInr(total)}
      </div>
    </div>
  )
}

export function ProjectionChart({ data, series }: { data: ProjectionStackPoint[]; series: ProjectionSeriesDef[] }) {
  const tickInterval = Math.max(0, Math.ceil(data.length / 12) - 1)

  return (
    <div className={primitives.card}>
      <div className={primitives.cardHeader}>
        <div className={styles.title}>Projected Portfolio Value</div>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--text)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
          />
          <YAxis
            stroke="var(--text)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactInr}
            width={56}
          />
          <Tooltip
            content={<StackTooltip series={series} />}
            cursor={{ fill: 'color-mix(in srgb, var(--text-h) 6%, transparent)' }}
          />
          <Legend
            wrapperStyle={legendStyle}
            formatter={(value: string) => series.find((s) => s.key === value)?.label ?? value}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.key}
              stackId="portfolio"
              fill={s.color}
              stroke="var(--card-bg)"
              strokeWidth={2}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
