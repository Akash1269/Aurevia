import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { GainText } from '../components/GainText'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { InfoTooltip } from '../components/InfoTooltip'
import { StockHeatmap, type HeatmapDatum } from '../components/StockHeatmap'
import { LayoutGrid, ListChecks, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { ComputedUsStock } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatCompactUsd, formatInr, formatPct, formatUsd } from '../utils/format'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedUsStock>[] = [
  { key: 'symbol', label: 'Symbol', render: (r) => r.symbol, sortValue: (r) => r.symbol },
  {
    key: 'name',
    label: 'Name',
    render: (r) => r.name,
    sortValue: (r) => r.name,
    truncate: '180px',
    title: (r) => r.name,
  },
  { key: 'quantity', label: 'Qty', align: 'right', render: (r) => r.quantity, sortValue: (r) => r.quantity },
  {
    key: 'avg',
    label: 'Avg Buy',
    align: 'right',
    render: (r) => formatUsd(r.avg_buy_price_usd),
    sortValue: (r) => r.avg_buy_price_usd,
    hideOnMobile: true,
  },
  {
    key: 'current',
    label: 'Current Price',
    align: 'right',
    render: (r) => formatUsd(r.current_price_usd),
    sortValue: (r) => r.current_price_usd,
    hideOnMobile: true,
  },
  { key: 'invested', label: 'Invested', align: 'right', render: (r) => formatUsd(r.invested), sortValue: (r) => r.invested },
  { key: 'value', label: 'Value', align: 'right', render: (r) => formatUsd(r.current), sortValue: (r) => r.current },
  {
    key: 'gain',
    label: 'Gain %',
    align: 'right',
    render: (r) => <GainText value={r.gainPct}>{formatPct(r.gainPct)}</GainText>,
    sortValue: (r) => r.gainPct,
  },
]

export function UsStocksPage() {
  const { results, ratesMap } = usePortfolioData()
  const { rows, totals, error } = results.usStocks

  if (error) return <ErrorState message={error} />

  const heatmapData: HeatmapDatum[] = rows.map((r) => ({ name: r.symbol, size: r.current, gainPct: r.gainPct }))
  const usdToInr = ratesMap.USD

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
          sublabel={usdToInr ? `1 USD ≈ ${formatInr(usdToInr)}` : undefined}
        />
        <KpiCard icon={ListChecks} label="Holdings" value={String(rows.length)} />
      </div>
      <Card icon={LayoutGrid} title="By Symbol">
        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <StockHeatmap data={heatmapData} formatCompact={formatCompactUsd} formatFull={formatUsd} />
            <div className={styles.chartLegend}>
              <InfoTooltip>
                Dark green ≥ 30% gain · Green 0–30% gain
                <br />
                Light red 0–15% loss · Dark red &gt; 15% loss
              </InfoTooltip>
              <span className={primitives.mutedText}>Size = current value · Color = gain/loss</span>
            </div>
          </>
        )}
      </Card>

      <Card>{rows.length === 0 ? <EmptyState /> : <HoldingsTable columns={columns} rows={rows} />}</Card>
    </>
  )
}
