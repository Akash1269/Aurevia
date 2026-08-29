import { AllocationDonut, type DonutDatum } from '../components/AllocationDonut'
import { Card } from '../components/Card'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { Coins, Lock, PieChart, TrendingUp, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { toInr } from '../data/portfolio'
import type { ComputedFixedDeposit } from '../data/types'
import { formatDate, formatInr } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedFixedDeposit>[] = [
  { key: 'bank_name', label: 'Bank', render: (r) => r.bank_name, sortValue: (r) => r.bank_name },
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
  { key: 'start', label: 'Start', render: (r) => formatDate(r.start_date), sortValue: (r) => new Date(r.start_date).getTime() },
  {
    key: 'maturity',
    label: 'Maturity',
    render: (r) => formatDate(r.maturity_date),
    sortValue: (r) => new Date(r.maturity_date).getTime(),
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
  const donutData: DonutDatum[] = rows.map((r, i) => ({ name: r.bank_name, value: r.currentInr, color: colorForIndex(i) }))
  const totalInterestAtMaturity = totalMaturityInr - totals.investedInr

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={Wallet} label="Total Principal" value={formatInr(totals.investedInr)} />
        <KpiCard icon={TrendingUp} label="Accrued Current Value" value={formatInr(totals.currentInr)} />
        <KpiCard icon={Lock} label="Total Maturity Value" value={formatInr(totalMaturityInr)} sublabel="at full term" />
        <KpiCard icon={Coins} label="Interest at Maturity" value={formatInr(totalInterestAtMaturity)} />
      </div>
      <div className={styles.body}>
        <Card>{rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={columns} rows={rows} />}</Card>
        <Card icon={PieChart} title="By Bank" align="center">
          {rows.length === 0 ? <EmptyState /> : <AllocationDonut data={donutData} />}
        </Card>
      </div>
    </>
  )
}
