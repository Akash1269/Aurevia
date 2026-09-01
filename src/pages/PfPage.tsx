import { useState } from 'react'
import { Card } from '../components/Card'
import { ContributionTimelineChart, type ContributionTimelinePoint } from '../components/ContributionTimelineChart'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { Building2, Calendar, Filter, History, ListChecks, ListFilter, Shield, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { MultiSelectDropdown } from '../components/MultiSelectDropdown'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { PfEntryType, PfStatementRow } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatInr, formatMonth, monthSortKey } from '../utils/format'
import categoryStyles from './CategoryPage.module.css'
import styles from './PfPage.module.css'

const ALL_COMPANIES = 'All'
const ENTRY_TYPE_OPTIONS: { value: PfEntryType; label: string }[] = [
  { value: 'Contribution', label: 'Contribution' },
  { value: 'Interest', label: 'Interest' },
]

interface PfCompanySummary {
  displayName: string
  company: string
  fromYear: number
  toYear: number
  employee: number
  employer: number
  interestEarned: number
  total: number
}

// Account Summary is built entirely from statements.csv now (not
// account-summary.csv). That ledger has no transfer/withdrawal transactions,
// so Member ID, Current Balance, Adjustments, Transfer-In, and Withdrawal
// have no honest source here and are left out rather than faked - summing
// contributions alone would show closed accounts (money since transferred
// to a later employer) as still holding a large positive balance.
function buildAccountSummary(rows: PfStatementRow[]): PfCompanySummary[] {
  const map = new Map<string, Omit<PfCompanySummary, 'total'>>()
  for (const row of rows) {
    const year = Number(row.transaction_date.split('/')[2]) || 0
    const existing = map.get(row.company) ?? {
      displayName: row.company,
      company: row.company,
      fromYear: year,
      toYear: year,
      employee: 0,
      employer: 0,
      interestEarned: 0,
    }
    existing.fromYear = Math.min(existing.fromYear, year)
    existing.toYear = Math.max(existing.toYear, year)
    if (row.type === 'Contribution') {
      existing.employee += row.employee
      existing.employer += row.employer
    } else {
      existing.interestEarned += row.total
    }
    map.set(row.company, existing)
  }
  return Array.from(map.values())
    .map((r) => ({ ...r, total: r.employee + r.employer + r.interestEarned }))
    .sort((a, b) => a.company.localeCompare(b.company))
}

const accountSummaryColumns: HoldingsColumn<PfCompanySummary>[] = [
  {
    key: 'company',
    label: 'Company',
    render: (r) => r.company,
    sortValue: (r) => r.company,
    truncate: '140px',
    title: (r) => r.company,
  },
  { key: 'years', label: 'Years', render: (r) => `${r.fromYear}–${r.toYear}`, sortValue: (r) => r.fromYear },
  { key: 'employee', label: 'Employee', align: 'right', render: (r) => formatInr(r.employee), sortValue: (r) => r.employee },
  { key: 'employer', label: 'Employer', align: 'right', render: (r) => formatInr(r.employer), sortValue: (r) => r.employer },
  {
    key: 'interest_earned',
    label: 'Interest Earned',
    align: 'right',
    render: (r) => formatInr(r.interestEarned),
    sortValue: (r) => r.interestEarned,
  },
  { key: 'total', label: 'Total', align: 'right', render: (r) => formatInr(r.total), sortValue: (r) => r.total },
]

const statementColumns: HoldingsColumn<PfStatementRow>[] = [
  {
    key: 'company',
    label: 'Company',
    render: (r) => r.company,
    sortValue: (r) => r.company,
    truncate: '110px',
    title: (r) => r.company,
  },
  { key: 'month', label: 'Month', render: (r) => formatMonth(r.month), sortValue: (r) => monthSortKey(r.month) },
  {
    key: 'transaction_date',
    label: 'Transaction Date',
    render: (r) => r.transaction_date,
    sortValue: (r) => monthSortKey(r.transaction_date),
    hideOnMobile: true,
  },
  {
    key: 'type',
    label: 'Type',
    render: (r) => (r.type === 'Interest' ? <span className={primitives.badge}>{r.type}</span> : r.type),
    sortValue: (r) => r.type,
  },
  { key: 'employee', label: 'Employee', align: 'right', render: (r) => formatInr(r.employee), sortValue: (r) => r.employee },
  { key: 'employer', label: 'Employer', align: 'right', render: (r) => formatInr(r.employer), sortValue: (r) => r.employer },
  {
    key: 'pension',
    label: 'Pension',
    align: 'right',
    render: (r) => (r.pension === null ? '—' : formatInr(r.pension)),
    sortValue: (r) => r.pension ?? 0,
    hideOnMobile: true,
  },
  { key: 'total', label: 'Total', align: 'right', render: (r) => formatInr(r.total), sortValue: (r) => r.total },
  {
    key: 'notes',
    label: 'Notes',
    render: (r) => r.notes || '—',
    sortValue: (r) => r.notes,
    truncate: '180px',
    title: (r) => r.notes,
    hideOnMobile: true,
  },
]

function buildTimeline(rows: PfStatementRow[]): ContributionTimelinePoint[] {
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
  const { results, pfStatements } = usePortfolioData()
  const { error } = results.pf
  const [companyFilter, setCompanyFilter] = useState(ALL_COMPANIES)
  const [typeFilter, setTypeFilter] = useState<Set<string>>(() => new Set(ENTRY_TYPE_OPTIONS.map((o) => o.value)))

  if (error) return <ErrorState message={error} />

  const accountSummary = buildAccountSummary(pfStatements.rows)

  const totalContributions = accountSummary.reduce((sum, r) => sum + r.employee + r.employer, 0)
  const totalInterestEarned = accountSummary.reduce((sum, r) => sum + r.interestEarned, 0)
  const totalAccountBalance = totalContributions + totalInterestEarned

  const statements = [...pfStatements.rows].sort(
    (a, b) =>
      monthSortKey(a.transaction_date) - monthSortKey(b.transaction_date) ||
      a.company.localeCompare(b.company) ||
      a.type.localeCompare(b.type),
  )

  const timeline = buildTimeline(statements.filter((r) => r.type === 'Contribution'))
  const interestTimeline = buildTimeline(statements.filter((r) => r.type === 'Interest'))

  const companies = Array.from(new Set(statements.map((r) => r.company))).sort()
  const filteredStatements = statements.filter(
    (r) => (companyFilter === ALL_COMPANIES || r.company === companyFilter) && typeFilter.has(r.type),
  )

  const statementTotals = filteredStatements.reduce(
    (acc, r) => ({
      employee: acc.employee + r.employee,
      employer: acc.employer + r.employer,
      pension: acc.pension + (r.pension ?? 0),
      total: acc.total + r.total,
    }),
    { employee: 0, employer: 0, pension: 0, total: 0 },
  )

  return (
    <>
      <div className={categoryStyles.kpiRow}>
        <KpiCard
          icon={Shield}
          label="Total Balance"
          value={formatInr(totalAccountBalance)}
          sublabel="contributions + interest"
        />
        <KpiCard
          icon={Wallet}
          label="Total Contributions"
          value={formatInr(totalContributions)}
          sublabel="employee + employer, lifetime"
        />
        <KpiCard icon={Calendar} label="Total Interest Earned" value={formatInr(totalInterestEarned)} />
        <KpiCard icon={Building2} label="Accounts" value={String(accountSummary.length)} />
      </div>
      <Card icon={ListChecks} title="Account Summary">
        {accountSummary.length === 0 ? <EmptyState /> : <HoldingsTable columns={accountSummaryColumns} rows={accountSummary} />}
      </Card>
      {timeline.length > 0 && <ContributionTimelineChart data={timeline} />}
      {interestTimeline.length > 0 && (
        <ContributionTimelineChart
          data={interestTimeline}
          title="Interest Credited Over Time"
          barName="Interest Credited"
          lineName="Cumulative Interest"
        />
      )}
      {pfStatements.error ? (
        <ErrorState message={pfStatements.error} />
      ) : statements.length === 0 ? (
        <EmptyState />
      ) : (
        <Card
          icon={History}
          title="Contribution & Interest History"
          actions={<span className={primitives.mutedText}>{filteredStatements.length} entries</span>}
        >
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="pf-company-filter">
                <Filter size={14} />
                Company
              </label>
              <select
                id="pf-company-filter"
                className={styles.select}
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
              >
                <option value={ALL_COMPANIES}>All Companies</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>
                <ListFilter size={14} />
                Type
              </span>
              <MultiSelectDropdown
                options={ENTRY_TYPE_OPTIONS}
                selected={typeFilter}
                onChange={setTypeFilter}
                allLabel="All Types"
                noneLabel="No types selected"
              />
            </div>
          </div>
          <HoldingsTable
            columns={statementColumns}
            rows={filteredStatements}
            footer={{
              company: 'Total',
              employee: formatInr(statementTotals.employee),
              employer: formatInr(statementTotals.employer),
              pension: formatInr(statementTotals.pension),
              total: formatInr(statementTotals.total),
            }}
          />
        </Card>
      )}
    </>
  )
}
