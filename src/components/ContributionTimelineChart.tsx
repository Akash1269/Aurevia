import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import primitives from '../styles/primitives.module.css'
import { formatCompactInr, formatInr } from '../utils/format'
import styles from './ContributionTimelineChart.module.css'

export interface ContributionTimelinePoint {
  label: string
  total: number
  runningTotal: number
}

const tooltipStyle = { background: '#1a1a1e', border: '1px solid var(--card-dark-border)', borderRadius: 10 }
const legendStyle = { color: 'var(--card-dark-muted)', fontSize: 12 }

export function ContributionTimelineChart({ data }: { data: ContributionTimelinePoint[] }) {
  const tickInterval = Math.max(0, Math.ceil(data.length / 10) - 1)

  return (
    <div className={primitives.cardDark}>
      <div className={primitives.cardHeader}>
        <div className={styles.title}>Contributions Over Time</div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--card-dark-border)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--card-dark-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
          />
          <YAxis
            yAxisId="left"
            stroke="var(--card-dark-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactInr}
            width={56}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="var(--card-dark-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactInr}
            width={56}
          />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} formatter={(value: number) => formatInr(value)} />
          <Legend wrapperStyle={legendStyle} />
          <Bar yAxisId="left" dataKey="total" name="Monthly Total" fill="#4b4b52" radius={[3, 3, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="runningTotal"
            name="Running Total"
            stroke="#ffffff"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
