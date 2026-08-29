import { AllocationDonut, type DonutDatum } from '../components/AllocationDonut'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { BankIcon, CalendarIcon, WalletIcon } from '../components/icons'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedSavings } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatInr } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedSavings>[] = [
  { key: 'bank_name', label: 'Bank', render: (r) => r.bank_name },
  { key: 'account_type', label: 'Type', render: (r) => r.account_type },
  {
    key: 'balance',
    label: 'Balance',
    align: 'right',
    render: (r) => `${r.balance.toLocaleString('en-IN')} ${r.currency}`,
  },
  { key: 'balance_inr', label: 'Balance (INR)', align: 'right', render: (r) => formatInr(r.currentInr) },
  { key: 'rate', label: 'Interest Rate', align: 'right', render: (r) => `${r.interest_rate_pct}%` },
]

export function SavingsPage() {
  const { results } = usePortfolioData()
  const { rows, totals, error } = results.savings

  if (error) return <ErrorState message={error} />

  const weightedRate =
    totals.currentInr === 0
      ? 0
      : rows.reduce((sum, r) => sum + r.interest_rate_pct * r.currentInr, 0) / totals.currentInr

  const donutData: DonutDatum[] = rows.map((r, i) => ({ name: r.bank_name, value: r.currentInr, color: colorForIndex(i) }))

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={WalletIcon} label="Total Balance" value={formatInr(totals.currentInr)} />
        <KpiCard icon={CalendarIcon} label="Weighted Avg Interest Rate" value={`${weightedRate.toFixed(2)}%`} />
        <KpiCard icon={BankIcon} label="Accounts" value={String(rows.length)} />
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
