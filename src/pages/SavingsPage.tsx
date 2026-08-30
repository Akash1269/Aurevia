import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { Calendar, Landmark, PiggyBank, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedSavings } from '../data/types'
import { formatInr } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedSavings>[] = [
  {
    key: 'bank_name',
    label: 'Bank',
    render: (r) => r.bank_name,
    sortValue: (r) => r.bank_name,
    truncate: '140px',
    title: (r) => r.bank_name,
  },
  { key: 'account_type', label: 'Type', render: (r) => r.account_type, sortValue: (r) => r.account_type },
  {
    key: 'balance',
    label: 'Balance',
    align: 'right',
    render: (r) => `${r.balance.toLocaleString('en-IN')} ${r.currency}`,
    sortValue: (r) => r.balance,
    hideOnMobile: true,
  },
  {
    key: 'balance_inr',
    label: 'Balance (INR)',
    align: 'right',
    render: (r) => formatInr(r.currentInr),
    sortValue: (r) => r.currentInr,
  },
  {
    key: 'rate',
    label: 'Interest Rate',
    align: 'right',
    render: (r) => `${r.interest_rate_pct}%`,
    sortValue: (r) => r.interest_rate_pct,
  },
]

export function SavingsPage() {
  const { results } = usePortfolioData()
  const { rows, totals, error } = results.savings

  if (error) return <ErrorState message={error} />

  const weightedRate =
    totals.currentInr === 0
      ? 0
      : rows.reduce((sum, r) => sum + r.interest_rate_pct * r.currentInr, 0) / totals.currentInr

  const estimatedAnnualInterest = totals.currentInr * (weightedRate / 100)

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={Wallet} label="Total Balance" value={formatInr(totals.currentInr)} />
        <KpiCard icon={Calendar} label="Weighted Avg Interest Rate" value={`${weightedRate.toFixed(2)}%`} />
        <KpiCard icon={Landmark} label="Accounts" value={String(rows.length)} />
        <KpiCard icon={PiggyBank} label="Est. Annual Interest" value={formatInr(estimatedAnnualInterest)} />
      </div>
      <Card>{rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={columns} rows={rows} />}</Card>
    </>
  )
}
