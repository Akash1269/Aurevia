import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import primitives from '../styles/primitives.module.css'
import { formatCompactInr, formatInr } from '../utils/format'
import styles from './ProjectionChart.module.css'

export interface ProjectionPoint {
  label: string
  value: number
}

const tooltipStyle = { background: '#1a1a1e', border: '1px solid var(--card-dark-border)', borderRadius: 10 }

export function ProjectionChart({ data }: { data: ProjectionPoint[] }) {
  const tickInterval = Math.max(0, Math.ceil(data.length / 10) - 1)

  return (
    <div className={primitives.cardDark}>
      <div className={primitives.cardHeader}>
        <div className={styles.title}>Projected Portfolio Value</div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
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
            stroke="var(--card-dark-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactInr}
            width={56}
          />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} formatter={(value: number) => formatInr(value)} />
          <Line type="monotone" dataKey="value" name="Projected Value" stroke="#ffffff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
