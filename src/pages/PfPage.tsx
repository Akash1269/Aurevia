import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { CalendarIcon, ShieldIcon, WalletIcon } from '../components/icons'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedPf } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatInr } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedPf>[] = [
  { key: 'employer', label: 'Employer', render: (r) => r.employer },
  { key: 'account_label', label: 'Account', render: (r) => r.account_label },
  { key: 'balance', label: 'Balance', align: 'right', render: (r) => formatInr(r.balance) },
  { key: 'employee', label: 'Employee / mo', align: 'right', render: (r) => formatInr(r.employee_contribution_monthly) },
  {
    key: 'employer_contrib',
    label: 'Employer / mo',
    align: 'right',
    render: (r) => formatInr(r.employer_contribution_monthly),
  },
  { key: 'rate', label: 'Interest Rate', align: 'right', render: (r) => `${r.interest_rate_pct}%` },
]

export function PfPage() {
  const { results } = usePortfolioData()
  const { rows, totals, error } = results.pf

  if (error) return <ErrorState message={error} />

  const totalMonthly = rows.reduce(
    (sum, r) => sum + r.employee_contribution_monthly + r.employer_contribution_monthly,
    0,
  )

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={ShieldIcon} label="Total Balance" value={formatInr(totals.currentInr)} />
        <KpiCard icon={WalletIcon} label="Total Monthly Contribution" value={formatInr(totalMonthly)} />
        <KpiCard icon={CalendarIcon} label="Effective Annual Contribution" value={formatInr(totalMonthly * 12)} />
      </div>
      <div className={primitives.card}>
        {rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={columns} rows={rows} />}
      </div>
    </>
  )
}
