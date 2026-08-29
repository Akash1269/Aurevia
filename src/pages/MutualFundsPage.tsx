import { AllocationDonut, type DonutDatum } from '../components/AllocationDonut'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { TrendDownIcon, TrendUpIcon, WalletIcon } from '../components/icons'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedMutualFund } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatInr, formatPct } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedMutualFund>[] = [
  { key: 'fund_name', label: 'Fund', render: (r) => r.fund_name },
  { key: 'category', label: 'Category', render: (r) => r.category },
  { key: 'units', label: 'Units', align: 'right', render: (r) => r.units.toFixed(2) },
  { key: 'avg_nav', label: 'Avg NAV', align: 'right', render: (r) => formatInr(r.avg_nav) },
  { key: 'current_nav', label: 'Current NAV', align: 'right', render: (r) => formatInr(r.current_nav) },
  { key: 'invested', label: 'Invested', align: 'right', render: (r) => formatInr(r.invested) },
  { key: 'value', label: 'Value', align: 'right', render: (r) => formatInr(r.current) },
  { key: 'gain', label: 'Gain %', align: 'right', render: (r) => formatPct(r.gainPct) },
]

export function MutualFundsPage() {
  const { results } = usePortfolioData()
  const { rows, totals, error } = results.mutualFunds

  if (error) return <ErrorState message={error} />

  const byCategory = new Map<string, number>()
  for (const row of rows) {
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + row.current)
  }
  const donutData: DonutDatum[] = Array.from(byCategory.entries()).map(([name, value], i) => ({
    name,
    value,
    color: colorForIndex(i),
  }))

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={WalletIcon} label="Invested" value={formatInr(totals.invested)} />
        <KpiCard icon={TrendUpIcon} label="Current Value" value={formatInr(totals.current)} />
        <KpiCard
          icon={totals.gain >= 0 ? TrendUpIcon : TrendDownIcon}
          label="Gain / Loss"
          value={formatInr(totals.gain)}
          badge={formatPct(totals.gainPct)}
        />
      </div>
      <div className={styles.body}>
        <div className={primitives.card}>
          {rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={columns} rows={rows} />}
        </div>
        <div className={`${primitives.card} ${styles.donutCard}`}>
          <div className={styles.donutTitle}>By Category</div>
          {rows.length === 0 ? <EmptyState /> : <AllocationDonut data={donutData} />}
        </div>
      </div>
    </>
  )
}
