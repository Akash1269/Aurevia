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

const tooltipStyle = { background: '#1a1a1e', border: '1px solid var(--card-dark-border)', borderRadius: 10 }
const legendStyle = { color: 'var(--card-dark-muted)', fontSize: 12 }

export function InvestedVsCurrentChart({ data }: { data: InvestedVsCurrentDatum[] }) {
  const [view, setView] = useState<ViewMode>('amount')

  return (
    <div className={`${primitives.cardDark} ${styles.card}`}>
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
            <CartesianGrid stroke="var(--card-dark-border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--card-dark-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} formatter={(value: number) => formatInr(value)} />
            <Legend wrapperStyle={legendStyle} />
            <Bar dataKey="invested" name="Invested" fill="#4b4b52" radius={[4, 4, 0, 0]} />
            <Bar dataKey="current" name="Current" fill="#ffffff" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--card-dark-border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--card-dark-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} formatter={(value: number) => formatPct(value)} />
            <Bar dataKey="gainPct" name="Gain %" fill="#ffffff" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
