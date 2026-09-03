import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import primitives from '../styles/primitives.module.css'
import { formatCompactInr, formatInr } from '../utils/format'
import styles from './ContributionTimelineChart.module.css'

export interface ContributionTimelinePoint {
  label: string
  total: number
  runningTotal: number
}

const tooltipStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10 }
const legendStyle = { color: 'var(--text)', fontSize: 12 }

export function ContributionTimelineChart({
  data,
  title = 'Contributions Over Time',
  barName = 'Monthly Total',
  lineName = 'Running Total',
}: {
  data: ContributionTimelinePoint[]
  title?: string
  barName?: string
  lineName?: string
}) {
  const tickInterval = Math.max(0, Math.ceil(data.length / 10) - 1)

  return (
    <div className={primitives.card}>
      <div className={primitives.cardHeader}>
        <div className={styles.title}>{title}</div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
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
            yAxisId="left"
            stroke="var(--text)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactInr}
            width={56}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="var(--text)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactInr}
            width={56}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: 'var(--text-h)' }}
            formatter={(value: number) => formatInr(value)}
          />
          <Legend wrapperStyle={legendStyle} />
          <Bar yAxisId="left" dataKey="total" name={barName} fill="var(--alloc-4)" radius={[3, 3, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="runningTotal"
            name={lineName}
            stroke="var(--alloc-1)"
            strokeWidth={5}
            dot={{ r: 5, strokeWidth: 3, stroke: 'var(--alloc-1)', fill: 'var(--card-bg)' }}
            activeDot={{ r: 6, strokeWidth: 3, stroke: 'var(--alloc-1)', fill: 'var(--card-bg)' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
