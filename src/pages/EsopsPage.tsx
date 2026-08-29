import { AllocationDonut, type DonutDatum } from '../components/AllocationDonut'
import { Card } from '../components/Card'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { GainText } from '../components/GainText'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { ListChecks, PieChart, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedEsop } from '../data/types'
import { formatInr, formatPct } from '../utils/format'
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
    render: (r) => r.avg_purchase_price.toLocaleString('en-IN'),
    sortValue: (r) => r.avg_purchase_price,
    hideOnMobile: true,
  },
  {
    key: 'current_price',
    label: 'Current Price',
    align: 'right',
    render: (r) => r.current_price.toLocaleString('en-IN'),
    sortValue: (r) => r.current_price,
    hideOnMobile: true,
  },
  { key: 'currency', label: 'Currency', render: (r) => r.currency, sortValue: (r) => r.currency, hideOnMobile: true },
  {
    key: 'invested',
    label: 'Invested',
    align: 'right',
    render: (r) => r.invested.toLocaleString('en-IN'),
    sortValue: (r) => r.invested,
  },
  {
    key: 'value',
    label: 'Value',
    align: 'right',
    render: (r) => r.current.toLocaleString('en-IN'),
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

  const gainPctInr = totals.investedInr === 0 ? 0 : (totals.gainInr / totals.investedInr) * 100
  const donutData: DonutDatum[] = rows.map((r, i) => ({ name: r.company, value: r.currentInr, color: colorForIndex(i) }))

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={Wallet} label="Invested" value={formatInr(totals.investedInr)} />
        <KpiCard icon={TrendingUp} label="Current Value" value={formatInr(totals.currentInr)} />
        <KpiCard
          icon={totals.gainInr >= 0 ? TrendingUp : TrendingDown}
          label="Gain / Loss"
          value={formatInr(totals.gainInr)}
          badge={formatPct(gainPctInr)}
        />
        <KpiCard icon={ListChecks} label="Holdings" value={String(rows.length)} />
      </div>
      <div className={styles.chartRow}>
        <Card icon={PieChart} title="By Company" align="center">
          {rows.length === 0 ? <EmptyState /> : <AllocationDonut data={donutData} />}
        </Card>
      </div>
      <Card>{rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={columns} rows={rows} />}</Card>
    </>
  )
}
