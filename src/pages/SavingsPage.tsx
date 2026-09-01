import { AllocationBar } from '../components/AllocationBar'
import { AllocationLegend } from '../components/AllocationLegend'
import { Card } from '../components/Card'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { Calendar, PiggyBank, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedSavings } from '../data/types'
import { formatInr } from '../utils/format'
import styles from './CategoryPage.module.css'

const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹', USD: '$' }

function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? `${code} `
}

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
    render: (r) => `${currencySymbol(r.currency)}${r.balance.toLocaleString('en-IN')}`,
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

  const distribution = [...rows]
    .sort((a, b) => b.currentInr - a.currentInr)
    .map((r, i) => ({
      label: r.bank_name,
      pct: totals.currentInr === 0 ? 0 : (r.currentInr / totals.currentInr) * 100,
      amountInr: r.currentInr,
      color: colorForIndex(i),
    }))

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={Wallet} label="Total Balance" value={formatInr(totals.currentInr)} />
        <KpiCard icon={Calendar} label="Weighted Avg Interest Rate" value={`${weightedRate.toFixed(2)}%`} />
        <KpiCard icon={PiggyBank} label="Est. Annual Interest" value={formatInr(estimatedAnnualInterest)} />
        <Card>
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <AllocationBar segments={distribution} />
              <AllocationLegend entries={distribution} />
            </>
          )}
        </Card>
      </div>
      <Card>{rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={columns} rows={rows} />}</Card>
    </>
  )
}
