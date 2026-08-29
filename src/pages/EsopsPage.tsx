import { AllocationDonut, type DonutDatum } from '../components/AllocationDonut'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { BriefcaseIcon, TrendUpIcon, WalletIcon } from '../components/icons'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedEsop } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatDate, formatInr, formatPct } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedEsop>[] = [
  { key: 'company', label: 'Company', render: (r) => r.company },
  { key: 'grant_date', label: 'Grant Date', render: (r) => formatDate(r.grant_date) },
  { key: 'total_options', label: 'Total', align: 'right', render: (r) => r.total_options },
  { key: 'vested_options', label: 'Vested', align: 'right', render: (r) => r.vested_options },
  { key: 'unvested', label: 'Unvested', align: 'right', render: (r) => r.unvestedOptions },
  {
    key: 'exercise_price',
    label: 'Exercise Price',
    align: 'right',
    render: (r) => `${r.exercise_price} ${r.currency}`,
  },
  { key: 'current_fmv', label: 'Current FMV', align: 'right', render: (r) => `${r.current_fmv} ${r.currency}` },
  { key: 'gain', label: 'Vested Gain %', align: 'right', render: (r) => formatPct(r.gainPct) },
]

export function EsopsPage() {
  const { results } = usePortfolioData()
  const { rows, totals, error } = results.esops

  if (error) return <ErrorState message={error} />

  const totalUnvested = rows.reduce((sum, r) => sum + r.unvestedOptions, 0)
  const donutData: DonutDatum[] = rows.map((r, i) => ({ name: r.company, value: r.currentInr, color: colorForIndex(i) }))

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard
          icon={TrendUpIcon}
          label="Vested Value (Intrinsic)"
          value={formatInr(totals.gainInr)}
          sublabel="(current FMV − exercise price) × vested options"
        />
        <KpiCard
          icon={BriefcaseIcon}
          label="Unvested Options"
          value={totalUnvested.toLocaleString('en-IN')}
          sublabel="not yet exercisable"
        />
        <KpiCard icon={WalletIcon} label="Gain % on Vested" value={formatPct(totals.gainPct)} />
      </div>
      <div className={styles.body}>
        <div className={primitives.card}>
          {rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={columns} rows={rows} />}
        </div>
        <div className={`${primitives.card} ${styles.donutCard}`}>
          <div className={styles.donutTitle}>By Company</div>
          {rows.length === 0 ? <EmptyState /> : <AllocationDonut data={donutData} />}
        </div>
      </div>
    </>
  )
}
