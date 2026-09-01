import { AllocationBar } from '../components/AllocationBar'
import { AllocationLegend } from '../components/AllocationLegend'
import { Card } from '../components/Card'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { Coins, Lock, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { toInr } from '../data/portfolio'
import type { ComputedFixedDeposit } from '../data/types'
import { formatDate, formatInr } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedFixedDeposit>[] = [
  {
    key: 'bank_name',
    label: 'Bank',
    render: (r) => r.bank_name,
    sortValue: (r) => r.bank_name,
    truncate: '140px',
    title: (r) => r.bank_name,
  },
  {
    key: 'principal',
    label: 'Principal',
    align: 'right',
    render: (r) => `${r.principal.toLocaleString('en-IN')} ${r.currency}`,
    sortValue: (r) => r.principal,
  },
  {
    key: 'rate',
    label: 'Rate',
    align: 'right',
    render: (r) => `${r.interest_rate_pct}%`,
    sortValue: (r) => r.interest_rate_pct,
  },
  {
    key: 'start',
    label: 'Start',
    render: (r) => formatDate(r.start_date),
    sortValue: (r) => new Date(r.start_date).getTime(),
    hideOnMobile: true,
  },
  {
    key: 'maturity',
    label: 'Maturity',
    render: (r) => formatDate(r.maturity_date),
    sortValue: (r) => new Date(r.maturity_date).getTime(),
    hideOnMobile: true,
  },
  {
    key: 'accrued',
    label: 'Accrued Value',
    align: 'right',
    render: (r) => formatInr(r.currentInr),
    sortValue: (r) => r.currentInr,
  },
  {
    key: 'maturity_value',
    label: 'Maturity Value',
    align: 'right',
    render: (r) => `${r.maturity_value.toLocaleString('en-IN')} ${r.currency}`,
    sortValue: (r) => r.maturity_value,
  },
  {
    key: 'progress',
    label: '% Elapsed',
    align: 'right',
    render: (r) => `${r.accrualPct.toFixed(0)}%`,
    sortValue: (r) => r.accrualPct,
  },
]

export function FixedDepositsPage() {
  const { results, ratesMap } = usePortfolioData()
  const { rows, totals, error } = results.fixedDeposits

  if (error) return <ErrorState message={error} />

  const totalMaturityInr = rows.reduce((sum, r) => sum + toInr(r.maturity_value, r.currency, ratesMap), 0)
  const totalInterestAtMaturity = totalMaturityInr - totals.investedInr

  const byBank = new Map<string, number>()
  for (const r of rows) {
    byBank.set(r.bank_name, (byBank.get(r.bank_name) ?? 0) + r.currentInr)
  }
  const distribution = Array.from(byBank.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([label, amountInr], i) => ({
      label,
      pct: totals.currentInr === 0 ? 0 : (amountInr / totals.currentInr) * 100,
      amountInr,
      color: colorForIndex(i),
    }))

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={Wallet} label="Total Principal" value={formatInr(totals.investedInr)} />
        <KpiCard icon={Lock} label="Total Maturity Value" value={formatInr(totalMaturityInr)} sublabel="at full term" />
        <KpiCard icon={Coins} label="Interest at Maturity" value={formatInr(totalInterestAtMaturity)} />
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
