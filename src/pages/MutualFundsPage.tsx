import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { GainText } from '../components/GainText'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { Layers, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { useSearch } from '../context/SearchContext'
import { useSettings } from '../context/SettingsContext'
import { formatDisplayAmount } from '../data/portfolio'
import type { ComputedMutualFund } from '../data/types'
import { formatInr, formatPct, otherCurrency } from '../utils/format'
import { filterBySearch } from '../utils/search'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedMutualFund>[] = [
  {
    key: 'fund_name',
    label: 'Fund',
    render: (r) => r.fund_name,
    sortValue: (r) => r.fund_name,
    truncate: '220px',
    title: (r) => r.fund_name,
  },
  {
    key: 'category',
    label: 'Category',
    render: (r) => r.category,
    sortValue: (r) => r.category,
    truncate: '150px',
    title: (r) => r.category,
    hideOnMobile: true,
  },
  { key: 'units', label: 'Units', align: 'right', render: (r) => r.units.toFixed(2), sortValue: (r) => r.units },
  {
    key: 'avg_nav',
    label: 'Avg NAV',
    align: 'right',
    render: (r) => formatInr(r.avg_nav),
    sortValue: (r) => r.avg_nav,
    hideOnMobile: true,
  },
  {
    key: 'current_nav',
    label: 'Current NAV',
    align: 'right',
    render: (r) => formatInr(r.current_nav),
    sortValue: (r) => r.current_nav,
    hideOnMobile: true,
  },
  {
    key: 'invested',
    label: 'Invested',
    align: 'right',
    render: (r) => formatInr(r.invested),
    sortValue: (r) => r.invested,
  },
  { key: 'value', label: 'Value', align: 'right', render: (r) => formatInr(r.current), sortValue: (r) => r.current },
  {
    key: 'gain',
    label: 'Gain %',
    align: 'right',
    render: (r) => <GainText value={r.gainPct}>{formatPct(r.gainPct)}</GainText>,
    sortValue: (r) => r.gainPct,
  },
]

export function MutualFundsPage() {
  const { results, ratesMap } = usePortfolioData()
  const { rows, totals, error } = results.mutualFunds
  const { query } = useSearch()
  const { displayCurrency } = useSettings()

  if (error) return <ErrorState message={error} />

  const filteredRows = filterBySearch(rows, query)
  const altCurrency = otherCurrency(displayCurrency)

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard
          icon={TrendingUp}
          label="Current Value"
          value={formatDisplayAmount(totals.currentInr, displayCurrency, ratesMap)}
          sublabel={formatDisplayAmount(totals.currentInr, altCurrency, ratesMap)}
        />
        <KpiCard
          icon={Wallet}
          label="Invested"
          value={formatDisplayAmount(totals.investedInr, displayCurrency, ratesMap)}
          sublabel={formatDisplayAmount(totals.investedInr, altCurrency, ratesMap)}
        />
        <KpiCard
          icon={totals.gain >= 0 ? TrendingUp : TrendingDown}
          label="Gain / Loss"
          value={formatDisplayAmount(totals.gainInr, displayCurrency, ratesMap)}
          badge={formatPct(totals.gainPct)}
          badgeTone={totals.gainPct}
          sublabel={formatDisplayAmount(totals.gainInr, altCurrency, ratesMap)}
        />
        <KpiCard icon={Layers} label="Number of Funds" value={String(rows.length)} />
      </div>
      <Card>
        {rows.length === 0 ? (
          <EmptyState />
        ) : filteredRows.length === 0 ? (
          <EmptyState message={`No results for "${query}"`} />
        ) : (
          <HoldingsTable columns={columns} rows={filteredRows} />
        )}
      </Card>
    </>
  )
}
