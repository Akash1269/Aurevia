import { ContributionTimelineChart, type ContributionTimelinePoint } from '../components/ContributionTimelineChart'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { CalendarIcon, ShieldIcon, WalletIcon } from '../components/icons'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedPf, PfContributionRow } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatInr, formatMonth, formatSignedInr, monthSortKey } from '../utils/format'
import styles from './CategoryPage.module.css'

const accountSummaryColumns: HoldingsColumn<ComputedPf>[] = [
  { key: 'member_id', label: 'Member ID', render: (r) => r.member_id },
  { key: 'company', label: 'Company', render: (r) => r.company },
  { key: 'years', label: 'Years', align: 'right', render: (r) => r.years },
  { key: 'current_balance', label: 'Current Balance', align: 'right', render: (r) => formatInr(r.current_balance) },
  { key: 'adjustments', label: 'Adjustments', align: 'right', render: (r) => formatSignedInr(r.adjustments) },
  { key: 'employee', label: 'Employee', align: 'right', render: (r) => formatInr(r.employee) },
  { key: 'employer', label: 'Employer', align: 'right', render: (r) => formatInr(r.employer) },
  { key: 'interest_earned', label: 'Interest Earned', align: 'right', render: (r) => formatInr(r.interest_earned) },
  { key: 'transfer_in', label: 'Transfer-In', align: 'right', render: (r) => formatInr(r.transfer_in) },
  { key: 'withdrawal', label: 'Withdrawal', align: 'right', render: (r) => formatInr(r.withdrawal) },
]

const contributionColumns: HoldingsColumn<PfContributionRow>[] = [
  { key: 'company', label: 'Company', render: (r) => r.company },
  { key: 'month', label: 'Month', render: (r) => formatMonth(r.month) },
  { key: 'employee', label: 'Employee', align: 'right', render: (r) => formatInr(r.employee) },
  { key: 'employer', label: 'Employer', align: 'right', render: (r) => formatInr(r.employer) },
  { key: 'pension', label: 'Pension', align: 'right', render: (r) => formatInr(r.pension) },
  { key: 'total', label: 'Total', align: 'right', render: (r) => formatInr(r.total) },
]

function buildContributionTimeline(rows: PfContributionRow[]): ContributionTimelinePoint[] {
  const byMonth = new Map<string, number>()
  for (const row of rows) {
    byMonth.set(row.month, (byMonth.get(row.month) ?? 0) + row.total)
  }

  const sortedMonths = Array.from(byMonth.keys()).sort((a, b) => monthSortKey(a) - monthSortKey(b))

  let running = 0
  return sortedMonths.map((month) => {
    const total = byMonth.get(month) ?? 0
    running += total
    return { label: formatMonth(month), total, runningTotal: running }
  })
}

export function PfPage() {
  const { results, pfContributions } = usePortfolioData()
  const { rows, totals, error } = results.pf

  if (error) return <ErrorState message={error} />

  const totalContributions = rows.reduce((sum, r) => sum + r.employee + r.employer, 0)
  const totalInterestEarned = rows.reduce((sum, r) => sum + r.interest_earned, 0)

  const contributionRows = [...pfContributions.rows].sort(
    (a, b) => monthSortKey(a.month) - monthSortKey(b.month) || a.company.localeCompare(b.company),
  )

  const timeline = buildContributionTimeline(contributionRows)

  const contributionTotals = contributionRows.reduce(
    (acc, r) => ({
      employee: acc.employee + r.employee,
      employer: acc.employer + r.employer,
      pension: acc.pension + r.pension,
      total: acc.total + r.total,
    }),
    { employee: 0, employer: 0, pension: 0, total: 0 },
  )

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={ShieldIcon} label="Total Balance" value={formatInr(totals.currentInr)} />
        <KpiCard
          icon={WalletIcon}
          label="Total Contributions"
          value={formatInr(totalContributions)}
          sublabel="employee + employer, lifetime"
        />
        <KpiCard icon={CalendarIcon} label="Total Interest Earned" value={formatInr(totalInterestEarned)} />
      </div>
      <div className={primitives.card}>
        <div className={primitives.cardTitle} style={{ marginBottom: 16 }}>
          Account Summary
        </div>
        {rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={accountSummaryColumns} rows={rows} />}
      </div>
      {timeline.length > 0 && <ContributionTimelineChart data={timeline} />}
      <div className={primitives.card}>
        <div className={primitives.cardTitle} style={{ marginBottom: 16 }}>
          Monthly Contribution History
        </div>
        {pfContributions.error ? (
          <ErrorState message={pfContributions.error} />
        ) : contributionRows.length === 0 ? (
          <EmptyState />
        ) : (
          <HoldingsTable
            columns={contributionColumns}
            rows={contributionRows}
            footer={{
              company: 'Total',
              employee: formatInr(contributionTotals.employee),
              employer: formatInr(contributionTotals.employer),
              pension: formatInr(contributionTotals.pension),
              total: formatInr(contributionTotals.total),
            }}
          />
        )}
      </div>
    </>
  )
}
