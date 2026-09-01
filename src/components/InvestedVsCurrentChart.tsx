import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import primitives from '../styles/primitives.module.css'
import { formatInr, formatPct } from '../utils/format'
import styles from './InvestedVsCurrentChart.module.css'

export interface InvestedVsCurrentDatum {
  label: string
  invested: number
  current: number
  gainPct: number
}

type ViewMode = 'amount' | 'gain'

const tooltipStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10 }
const legendStyle = { color: 'var(--text)', fontSize: 12 }

export function InvestedVsCurrentChart({ data }: { data: InvestedVsCurrentDatum[] }) {
  const [view, setView] = useState<ViewMode>('amount')

  return (
    <div className={`${primitives.card} ${styles.card}`}>
      <div className={primitives.cardHeader}>
        <div className={styles.title}>Invested vs Current Value</div>
        <div className={primitives.pillTabs}>
          <button
            type="button"
            className={`${primitives.pillTab} ${view === 'amount' ? primitives.pillTabActive : ''}`}
            onClick={() => setView('amount')}
          >
            Amount (₹)
          </button>
          <button
            type="button"
            className={`${primitives.pillTab} ${view === 'gain' ? primitives.pillTabActive : ''}`}
            onClick={() => setView('gain')}
          >
            Gain %
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        {view === 'amount' ? (
          <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: 'var(--text-h)' }}
              formatter={(value: number) => formatInr(value)}
            />
            <Legend wrapperStyle={legendStyle} />
            <Bar dataKey="invested" name="Invested" fill="var(--text)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="current" name="Current" fill="var(--text-h)" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: 'var(--text-h)' }}
              formatter={(value: number) => formatPct(value)}
            />
            <Bar dataKey="gainPct" name="Gain %" fill="var(--text-h)" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
