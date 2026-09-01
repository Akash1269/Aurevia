import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatInr } from '../utils/format'
import styles from './AllocationDonut.module.css'

export interface DonutDatum {
  name: string
  value: number
  color: string
}

export function AllocationDonut({ data, showLegend = false }: { data: DonutDatum[]; showLegend?: boolean }) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const total = sorted.reduce((sum, d) => sum + d.value, 0)

  const chart = (
    <ResponsiveContainer width="100%" height={190}>
      <PieChart>
        <Pie data={sorted} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {sorted.map((d) => (
            <Cell key={d.name} fill={d.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatInr(value)}
          contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10 }}
          labelStyle={{ color: 'var(--text-h)' }}
          itemStyle={{ color: 'var(--text-h)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )

  if (!showLegend) return chart

  return (
    <div className={styles.withLegend}>
      <div className={styles.chartArea}>{chart}</div>
      <ul className={styles.legend}>
        {sorted.map((d) => (
          <li key={d.name} className={styles.legendRow}>
            <span className={styles.legendDot} style={{ background: d.color }} />
            <span className={styles.legendName} title={d.name}>
              {d.name}
            </span>
            <span className={styles.legendValue}>{total ? `${((d.value / total) * 100).toFixed(0)}%` : '0%'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
