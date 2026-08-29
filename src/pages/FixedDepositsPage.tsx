import { AllocationDonut, type DonutDatum } from '../components/AllocationDonut'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { LockIcon, TrendUpIcon, WalletIcon } from '../components/icons'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { toInr } from '../data/portfolio'
import type { ComputedFixedDeposit } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatDate, formatInr } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedFixedDeposit>[] = [
  { key: 'bank_name', label: 'Bank', render: (r) => r.bank_name },
  {
    key: 'principal',
    label: 'Principal',
    align: 'right',
    render: (r) => `${r.principal.toLocaleString('en-IN')} ${r.currency}`,
  },
  { key: 'rate', label: 'Rate', align: 'right', render: (r) => `${r.interest_rate_pct}%` },
  { key: 'start', label: 'Start', render: (r) => formatDate(r.start_date) },
  { key: 'maturity', label: 'Maturity', render: (r) => formatDate(r.maturity_date) },
  { key: 'accrued', label: 'Accrued Value', align: 'right', render: (r) => formatInr(r.currentInr) },
  {
    key: 'maturity_value',
    label: 'Maturity Value',
    align: 'right',
    render: (r) => `${r.maturity_value.toLocaleString('en-IN')} ${r.currency}`,
  },
  { key: 'progress', label: '% Elapsed', align: 'right', render: (r) => `${r.accrualPct.toFixed(0)}%` },
]

export function FixedDepositsPage() {
  const { results, ratesMap } = usePortfolioData()
  const { rows, totals, error } = results.fixedDeposits

  if (error) return <ErrorState message={error} />

  const totalMaturityInr = rows.reduce((sum, r) => sum + toInr(r.maturity_value, r.currency, ratesMap), 0)
  const donutData: DonutDatum[] = rows.map((r, i) => ({ name: r.bank_name, value: r.currentInr, color: colorForIndex(i) }))

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={WalletIcon} label="Total Principal" value={formatInr(totals.investedInr)} />
        <KpiCard icon={TrendUpIcon} label="Accrued Current Value" value={formatInr(totals.currentInr)} />
        <KpiCard icon={LockIcon} label="Total Maturity Value" value={formatInr(totalMaturityInr)} sublabel="at full term" />
      </div>
      <div className={styles.body}>
        <div className={primitives.card}>
          {rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={columns} rows={rows} />}
        </div>
        <div className={`${primitives.card} ${styles.donutCard}`}>
          <div className={styles.donutTitle}>By Bank</div>
          {rows.length === 0 ? <EmptyState /> : <AllocationDonut data={donutData} />}
        </div>
      </div>
    </>
  )
}
