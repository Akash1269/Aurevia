import { AllocationBar } from '../components/AllocationBar'
import { AllocationLegend } from '../components/AllocationLegend'
import { Card } from '../components/Card'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { GainText } from '../components/GainText'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedEsop } from '../data/types'
import { formatCurrency, formatInr, formatPct, formatUsd } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedEsop>[] = [
  {
    key: 'company',
    label: 'Company',
    render: (r) => r.company,
    sortValue: (r) => r.company,
    truncate: '140px',
    title: (r) => r.company,
  },
  { key: 'quantity', label: 'Quantity', align: 'right', render: (r) => r.quantity, sortValue: (r) => r.quantity },
  {
    key: 'avg_purchase_price',
    label: 'Avg Purchase Price',
    align: 'right',
    render: (r) => formatCurrency(r.avg_purchase_price, r.currency),
    sortValue: (r) => r.avg_purchase_price,
    hideOnMobile: true,
  },
  {
    key: 'current_price',
    label: 'Current Price',
    align: 'right',
    render: (r) => formatCurrency(r.current_price, r.currency),
    sortValue: (r) => r.current_price,
    hideOnMobile: true,
  },
  {
    key: 'invested',
    label: 'Invested',
    align: 'right',
    render: (r) => formatCurrency(r.invested, r.currency),
    sortValue: (r) => r.invested,
  },
  {
    key: 'value',
    label: 'Value',
    align: 'right',
    render: (r) => formatCurrency(r.current, r.currency),
    sortValue: (r) => r.current,
  },
  {
    key: 'value_inr',
    label: 'Value (INR)',
    align: 'right',
    render: (r) => formatInr(r.currentInr),
    sortValue: (r) => r.currentInr,
  },
  {
    key: 'gain',
    label: 'Gain %',
    align: 'right',
    render: (r) => <GainText value={r.gainPct}>{formatPct(r.gainPct)}</GainText>,
    sortValue: (r) => r.gainPct,
  },
]

export function EsopsPage() {
  const { results } = usePortfolioData()
  const { rows, totals, error } = results.esops

  if (error) return <ErrorState message={error} />

  const distribution = [...rows]
    .sort((a, b) => b.currentInr - a.currentInr)
    .map((r, i) => ({
      label: r.company,
      pct: totals.currentInr === 0 ? 0 : (r.currentInr / totals.currentInr) * 100,
      amountInr: r.currentInr,
      color: colorForIndex(i),
    }))

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard
          icon={Wallet}
          label="Invested"
          value={formatUsd(totals.invested)}
          sublabel={formatInr(totals.investedInr)}
        />
        <KpiCard
          icon={TrendingUp}
          label="Current Value"
          value={formatUsd(totals.current)}
          sublabel={formatInr(totals.currentInr)}
        />
        <KpiCard
          icon={totals.gain >= 0 ? TrendingUp : TrendingDown}
          label="Gain / Loss"
          value={formatUsd(totals.gain)}
          badge={formatPct(totals.gainPct)}
          badgeTone={totals.gainPct}
          sublabel={formatInr(totals.gainInr)}
        />
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
