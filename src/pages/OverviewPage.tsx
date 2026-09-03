import { AllocationBar } from '../components/AllocationBar'
import { AllocationLegend } from '../components/AllocationLegend'
import { ArrowLeftRight, ListChecks, TrendingDown, TrendingUp, Trophy, Wallet } from 'lucide-react'
import { Card } from '../components/Card'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { useSettings } from '../context/SettingsContext'
import { formatDisplayAmount } from '../data/portfolio'
import primitives from '../styles/primitives.module.css'
import { colorForIndex } from '../utils/colors'
import { formatInr, formatPct } from '../utils/format'
import styles from './OverviewPage.module.css'

export function OverviewPage() {
  const { overview, topHoldings, currencyExposure, results, ratesMap } = usePortfolioData()
  const { displayCurrency } = useSettings()

  const allocationSegments = overview.categories.map((c) => ({
    label: c.label,
    pct: c.pct,
    amountInr: c.currentInr,
    color: c.color,
  }))

  const totalHoldings =
    results.usStocks.rows.length +
    results.indiaStocks.rows.length +
    results.mutualFunds.rows.length +
    results.esops.rows.length +
    results.savings.rows.length +
    results.fixedDeposits.rows.length +
    results.pf.rows.length

  const categoriesUp = overview.categories.filter((c) => c.gainInr > 0).length
  const categoriesDown = overview.categories.filter((c) => c.gainInr < 0).length

  const totalExposureInr = currencyExposure.reduce((sum, c) => sum + c.amountInr, 0)
  const exposureSegments = currencyExposure.map((c, i) => ({
    label: c.code,
    pct: totalExposureInr === 0 ? 0 : (c.amountInr / totalExposureInr) * 100,
    amountInr: c.amountInr,
    color: colorForIndex(i),
  }))

  const bestPerformer = overview.categories.reduce((best, c) => (c.gainPct > best.gainPct ? c : best))

  return (
    <>
      <div className={styles.topRow}>
        <KpiCard
          icon={TrendingUp}
          label="Current Value"
          value={formatDisplayAmount(overview.totalCurrentInr, displayCurrency, ratesMap)}
          sublabel={`${totalHoldings} holdings across ${overview.categories.length} categories`}
        />
        <KpiCard
          icon={Wallet}
          label="Total Invested"
          value={formatDisplayAmount(overview.totalInvestedInr, displayCurrency, ratesMap)}
          sublabel={`${categoriesUp} up · ${categoriesDown} down`}
        />
        <KpiCard
          icon={overview.totalGainInr >= 0 ? TrendingUp : TrendingDown}
          label="Overall Gain / Loss"
          value={formatDisplayAmount(overview.totalGainInr, displayCurrency, ratesMap)}
          badge={formatPct(overview.totalGainPct)}
          badgeTone={overview.totalGainPct}
          sublabel={`${formatDisplayAmount(overview.totalInvestedInr, displayCurrency, ratesMap)} → ${formatDisplayAmount(overview.totalCurrentInr, displayCurrency, ratesMap)}`}
        />
        <KpiCard
          icon={Trophy}
          label="Best Performer"
          value={bestPerformer.label}
          badge={formatPct(bestPerformer.gainPct)}
          badgeTone={bestPerformer.gainPct}
          sublabel={`${formatDisplayAmount(bestPerformer.investedInr, displayCurrency, ratesMap)} → ${formatDisplayAmount(bestPerformer.currentInr, displayCurrency, ratesMap)}`}
        />
      </div>

      <div className={styles.mainRow}>
        <Card icon={Wallet} title="My Portfolio">
          <div className={styles.portfolioTotal}>
            {formatDisplayAmount(overview.totalCurrentInr, displayCurrency, ratesMap)}
          </div>
          <div className={primitives.mutedText}>{formatPct(overview.totalGainPct)} all-time</div>
          <div className={styles.allocationSection}>
            <AllocationBar segments={allocationSegments} />
            <AllocationLegend entries={allocationSegments} />
          </div>
        </Card>

        <div className={styles.stackedColumn}>
          <Card icon={ListChecks} title="Top Holdings">
            <div className={styles.holdingsScroll}>
              {topHoldings.map((h) => {
                const sharePct = overview.totalCurrentInr === 0 ? 0 : (h.currentInr / overview.totalCurrentInr) * 100
                return (
                  <div key={h.key} className={styles.holdingCard}>
                    <div className={styles.holdingName}>{h.categoryLabel}</div>
                    <div className={styles.holdingTitle} title={h.name}>
                      {h.name}
                    </div>
                    <div className={styles.holdingValue}>{formatInr(h.currentInr)}</div>
                    <div className={styles.holdingName}>{sharePct.toFixed(1)}% of portfolio</div>
                    <div className={styles.shareTrack}>
                      <div className={styles.shareFill} style={{ width: `${Math.min(100, Math.max(2, sharePct))}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card icon={ArrowLeftRight} title="Currency Exposure">
            <div className={styles.allocationSection}>
              <AllocationBar segments={exposureSegments} />
              <AllocationLegend entries={exposureSegments} />
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
