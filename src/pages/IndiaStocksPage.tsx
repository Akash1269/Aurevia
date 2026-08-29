import { AllocationDonut, type DonutDatum } from '../components/AllocationDonut'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { TrendDownIcon, TrendUpIcon, WalletIcon } from '../components/icons'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedIndiaStock } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatInr, formatPct } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedIndiaStock>[] = [
  { key: 'symbol', label: 'Symbol', render: (r) => r.symbol },
  { key: 'name', label: 'Name', render: (r) => r.name },
  { key: 'quantity', label: 'Qty', align: 'right', render: (r) => r.quantity },
  { key: 'avg', label: 'Avg Buy', align: 'right', render: (r) => formatInr(r.avg_buy_price_inr) },
  { key: 'current', label: 'Current Price', align: 'right', render: (r) => formatInr(r.current_price_inr) },
  { key: 'invested', label: 'Invested', align: 'right', render: (r) => formatInr(r.invested) },
  { key: 'value', label: 'Value', align: 'right', render: (r) => formatInr(r.current) },
  { key: 'gain', label: 'Gain %', align: 'right', render: (r) => formatPct(r.gainPct) },
]

export function IndiaStocksPage() {
  const { results } = usePortfolioData()
  const { rows, totals, error } = results.indiaStocks

  if (error) return <ErrorState message={error} />

  const donutData: DonutDatum[] = rows.map((r, i) => ({ name: r.symbol, value: r.current, color: colorForIndex(i) }))

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
          <div className={styles.donutTitle}>By Symbol</div>
          {rows.length === 0 ? <EmptyState /> : <AllocationDonut data={donutData} />}
        </div>
      </div>
    </>
  )
}
