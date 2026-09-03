import { AllocationDonut, type DonutDatum } from '../components/AllocationDonut'
import { Card } from '../components/Card'
import { colorForIndex } from '../utils/colors'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { GainText } from '../components/GainText'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { InfoTooltip } from '../components/InfoTooltip'
import { RankedList } from '../components/RankedList'
import { StockHeatmap, type HeatmapDatum } from '../components/StockHeatmap'
import { LayoutGrid, ListChecks, PieChart, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { useSearch } from '../context/SearchContext'
import { useSettings } from '../context/SettingsContext'
import { formatDisplayAmount } from '../data/portfolio'
import type { ComputedIndiaStock } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatInr, formatPct, formatSignedInr, otherCurrency } from '../utils/format'
import { filterBySearch } from '../utils/search'
import styles from './CategoryPage.module.css'

const columns: HoldingsColumn<ComputedIndiaStock>[] = [
  { key: 'symbol', label: 'Symbol', render: (r) => r.symbol, sortValue: (r) => r.symbol },
  {
    key: 'name',
    label: 'Name',
    render: (r) => r.name,
    sortValue: (r) => r.name,
    truncate: '170px',
    title: (r) => r.name,
  },
  {
    key: 'sector',
    label: 'Sector',
    render: (r) => r.sector,
    sortValue: (r) => r.sector,
    truncate: '110px',
    title: (r) => r.sector,
    hideOnMobile: true,
  },
  { key: 'quantity', label: 'Qty', align: 'right', render: (r) => r.quantity, sortValue: (r) => r.quantity },
  {
    key: 'avg',
    label: 'Avg Buy',
    align: 'right',
    render: (r) => formatInr(r.avg_buy_price_inr),
    sortValue: (r) => r.avg_buy_price_inr,
    hideOnMobile: true,
  },
  {
    key: 'current',
    label: 'Current Price',
    align: 'right',
    render: (r) => formatInr(r.current_price_inr),
    sortValue: (r) => r.current_price_inr,
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

export function IndiaStocksPage() {
  const { results, ratesMap } = usePortfolioData()
  const { rows, totals, error } = results.indiaStocks
  const { query } = useSearch()
  const { displayCurrency } = useSettings()

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
        <KpiCard icon={ListChecks} label="Holdings" value={String(rows.length)} />
      </div>

      <div className={styles.insightsRow}>
        <Card icon={PieChart} title="By Sector" align="center">
          {rows.length === 0 ? <EmptyState /> : <AllocationDonut data={sectorDonutData} showLegend />}
        </Card>
        <Card icon={TrendingUp} title="Top 5 Gainers" align="center">
          {topGainers.length === 0 ? (
            <EmptyState />
          ) : (
            <RankedList
              items={topGainers.map((r) => ({
                key: r.symbol,
                label: r.symbol,
                value: (
                  <GainText value={r.gain}>
                    {formatSignedInr(r.gain)} ({formatPct(r.gainPct)})
                  </GainText>
                ),
              }))}
            />
          )}
        </Card>
        <Card icon={TrendingDown} title="Top 5 Losers" align="center">
          {topLosers.length === 0 ? (
            <EmptyState />
          ) : (
            <RankedList
              items={topLosers.map((r) => ({
                key: r.symbol,
                label: r.symbol,
                value: (
                  <GainText value={r.gain}>
                    {formatSignedInr(r.gain)} ({formatPct(r.gainPct)})
                  </GainText>
                ),
              }))}
            />
          )}
        </Card>
      </div>

      <Card icon={LayoutGrid} title="By Stock">
        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <StockHeatmap data={heatmapData} />
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
