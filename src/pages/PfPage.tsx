import { useState } from 'react'
import { Card } from '../components/Card'
import { ContributionTimelineChart, type ContributionTimelinePoint } from '../components/ContributionTimelineChart'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { Building2, Calendar, History, ListChecks, Shield, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { MultiSelectDropdown } from '../components/MultiSelectDropdown'
import { Select } from '../components/Select'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { useSearch } from '../context/SearchContext'
import { useSettings } from '../context/SettingsContext'
import { buildPfAccountSummary, formatDisplayAmount } from '../data/portfolio'
import type { PfCompanySummary, PfEntryType, PfStatementRow } from '../data/types'
import { formatInr, formatMonth, monthSortKey, otherCurrency } from '../utils/format'
import { filterBySearch } from '../utils/search'
import categoryStyles from './CategoryPage.module.css'
import styles from './PfPage.module.css'

const ALL_COMPANIES = 'All'
const ENTRY_TYPE_OPTIONS: { value: PfEntryType; label: string }[] = [
  { value: 'Contribution', label: 'Contribution' },
  { value: 'Interest', label: 'Interest' },
]

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
  {
    key: 'employee',
    label: 'Employee',
    align: 'right',
    render: (r) => formatInr(r.employee),
    sortValue: (r) => r.employee,
  },
  {
    key: 'employer',
    label: 'Employer',
    align: 'right',
    render: (r) => formatInr(r.employer),
    sortValue: (r) => r.employer,
  },
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
    render: (r) => (r.type === 'Interest' ? <span className={styles.interestType}>{r.type}</span> : r.type),
    sortValue: (r) => r.type,
  },
  {
    key: 'employee',
    label: 'Employee',
    align: 'right',
    render: (r) => formatInr(r.employee),
    sortValue: (r) => r.employee,
  },
  {
    key: 'employer',
    label: 'Employer',
    align: 'right',
    render: (r) => formatInr(r.employer),
    sortValue: (r) => r.employer,
  },
  {
    key: 'pension',
    label: 'Pension',
    align: 'right',
    render: (r) => (r.pension === null ? '—' : formatInr(r.pension)),
    sortValue: (r) => r.pension ?? 0,
    hideOnMobile: true,
  },
  { key: 'total', label: 'Total', align: 'right', render: (r) => formatInr(r.total), sortValue: (r) => r.total },
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
  const { results, pfStatements, ratesMap } = usePortfolioData()
  const { error } = results.pf
  const { query } = useSearch()
  const { displayCurrency } = useSettings()
  const [companyFilter, setCompanyFilter] = useState(ALL_COMPANIES)
  const [typeFilter, setTypeFilter] = useState<Set<string>>(() => new Set(ENTRY_TYPE_OPTIONS.map((o) => o.value)))

  if (error) return <ErrorState message={error} />

  const accountSummary = buildPfAccountSummary(pfStatements.rows)
  const filteredAccountSummary = filterBySearch(accountSummary, query)
  const altCurrency = otherCurrency(displayCurrency)

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
  const filteredStatements = filterBySearch(
    statements.filter(
      (r) => (companyFilter === ALL_COMPANIES || r.company === companyFilter) && typeFilter.has(r.type),
    ),
    query,
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
          value={formatDisplayAmount(totalAccountBalance, displayCurrency, ratesMap)}
          sublabel="contributions + interest"
        />
        <KpiCard
          icon={Wallet}
          label="Total Contributions"
          value={formatDisplayAmount(totalContributions, displayCurrency, ratesMap)}
          sublabel="employee + employer, lifetime"
        />
        <KpiCard
          icon={Calendar}
          label="Total Interest Earned"
          value={formatDisplayAmount(totalInterestEarned, displayCurrency, ratesMap)}
          sublabel={formatDisplayAmount(totalInterestEarned, altCurrency, ratesMap)}
        />
        <KpiCard
          icon={Building2}
          label="Accounts"
          value={String(accountSummary.length)}
          sublabel={accountSummary.map((a) => a.company).join(' · ')}
        />
      </div>
      <Card icon={ListChecks} title="Account Summary">
        {accountSummary.length === 0 ? (
          <EmptyState />
        ) : filteredAccountSummary.length === 0 ? (
          <EmptyState message={`No results for "${query}"`} />
        ) : (
          <HoldingsTable columns={accountSummaryColumns} rows={filteredAccountSummary} />
        )}
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
          actions={
            <div className={styles.filterRow}>
              <Select
                aria-label="Filter by company"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
              >
                <option value={ALL_COMPANIES}>All Companies</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </Select>
              <MultiSelectDropdown
                options={ENTRY_TYPE_OPTIONS}
                selected={typeFilter}
                onChange={setTypeFilter}
                allLabel="All Types"
                noneLabel="No types selected"
                ariaLabel="Filter by entry type"
              />
            </div>
          }
        >
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
