import { AllocationDonut, type DonutDatum } from '../components/AllocationDonut'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { GainText } from '../components/GainText'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { RankedList } from '../components/RankedList'
import { StockHeatmap, type HeatmapDatum } from '../components/StockHeatmap'
import { ListChecks, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedIndiaStock } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatInr, formatPct, formatSignedInr } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedIndiaStock>[] = [
  { key: 'symbol', label: 'Symbol', render: (r) => r.symbol, sortValue: (r) => r.symbol },
  { key: 'name', label: 'Name', render: (r) => r.name, sortValue: (r) => r.name },
  { key: 'sector', label: 'Sector', render: (r) => r.sector, sortValue: (r) => r.sector },
  { key: 'quantity', label: 'Qty', align: 'right', render: (r) => r.quantity, sortValue: (r) => r.quantity },
  {
    key: 'avg',
    label: 'Avg Buy',
    align: 'right',
    render: (r) => formatInr(r.avg_buy_price_inr),
    sortValue: (r) => r.avg_buy_price_inr,
  },
  {
    key: 'current',
    label: 'Current Price',
    align: 'right',
    render: (r) => formatInr(r.current_price_inr),
    sortValue: (r) => r.current_price_inr,
  },
  { key: 'invested', label: 'Invested', align: 'right', render: (r) => formatInr(r.invested), sortValue: (r) => r.invested },
  { key: 'value', label: 'Value', align: 'right', render: (r) => formatInr(r.current), sortValue: (r) => r.current },
  {
    key: 'gain',
    label: 'Gain %',
    align: 'right',
    render: (r) => <GainText value={r.gainPct}>{formatPct(r.gainPct)}</GainText>,
    sortValue: (r) => r.gainPct,
  },
]

export function IndiaStocksPage() {
  const { results } = usePortfolioData()
  const { rows, totals, error } = results.indiaStocks

  if (error) return <ErrorState message={error} />

  const bySector = new Map<string, number>()
  for (const row of rows) {
    bySector.set(row.sector, (bySector.get(row.sector) ?? 0) + row.current)
  }
  const sectorDonutData: DonutDatum[] = Array.from(bySector.entries()).map(([name, value], i) => ({
    name,
    value,
    color: colorForIndex(i),
  }))

  const heatmapData: HeatmapDatum[] = rows.map((r) => ({ name: r.symbol, size: r.current, gainPct: r.gainPct }))

  const sortedByGain = [...rows].sort((a, b) => b.gain - a.gain)
  const topGainers = sortedByGain.slice(0, 5)
  const topLosers = sortedByGain.slice(-5).reverse()

  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard icon={Wallet} label="Invested" value={formatInr(totals.invested)} />
        <KpiCard icon={TrendingUp} label="Current Value" value={formatInr(totals.current)} />
        <KpiCard
          icon={totals.gain >= 0 ? TrendingUp : TrendingDown}
          label="Gain / Loss"
          value={formatInr(totals.gain)}
          badge={formatPct(totals.gainPct)}
        />
        <KpiCard icon={ListChecks} label="Holdings" value={String(rows.length)} />
      </div>

      <div className={styles.insightsRow}>
        <div className={`${primitives.card} ${styles.insightsCard}`}>
          <div className={styles.donutTitle}>By Sector</div>
          <div className={styles.insightsBody}>
            {rows.length === 0 ? <EmptyState /> : <AllocationDonut data={sectorDonutData} />}
          </div>
        </div>
        <div className={`${primitives.card} ${styles.insightsCard}`}>
          <div className={styles.donutTitle}>Top 5 Gainers</div>
          <div className={styles.insightsBody}>
            {topGainers.length === 0 ? (
              <EmptyState />
            ) : (
              <RankedList
                items={topGainers.map((r) => ({
                  key: r.symbol,
                  label: r.symbol,
                  value: <GainText value={r.gain}>{formatSignedInr(r.gain)}</GainText>,
                }))}
              />
            )}
          </div>
        </div>
        <div className={`${primitives.card} ${styles.insightsCard}`}>
          <div className={styles.donutTitle}>Top 5 Losers</div>
          <div className={styles.insightsBody}>
            {topLosers.length === 0 ? (
              <EmptyState />
            ) : (
              <RankedList
                items={topLosers.map((r) => ({
                  key: r.symbol,
                  label: r.symbol,
                  value: <GainText value={r.gain}>{formatSignedInr(r.gain)}</GainText>,
                }))}
              />
            )}
          </div>
        </div>
      </div>

      <div className={primitives.card}>
        <div className={styles.donutTitle}>By Stock (size = value, color = gain/loss)</div>
        {rows.length === 0 ? <EmptyState /> : <StockHeatmap data={heatmapData} />}
      </div>

      <div className={primitives.card}>
        {rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={columns} rows={rows} />}
      </div>
    </>
  )
}
