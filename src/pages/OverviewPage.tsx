import { Link } from 'react-router-dom'
import { AllocationBar } from '../components/AllocationBar'
import { AllocationDonut, type DonutDatum } from '../components/AllocationDonut'
import { AllocationLegend } from '../components/AllocationLegend'
import { ArrowLeftRight, ListChecks, PieChart, TrendingDown, TrendingUp, Trophy, Wallet } from 'lucide-react'
import { Card } from '../components/Card'
import { InvestedVsCurrentChart, type InvestedVsCurrentDatum } from '../components/InvestedVsCurrentChart'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { useSettings } from '../context/SettingsContext'
import { formatDisplayAmount } from '../data/portfolio'
import primitives from '../styles/primitives.module.css'
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

  const chartData: InvestedVsCurrentDatum[] = overview.categories.map((c) => ({
    label: c.label.replace(' Accounts', '').replace(' Deposits', ''),
    invested: c.investedInr,
    current: c.currentInr,
    gainPct: c.gainPct,
  }))

  const maxExposure = Math.max(...currencyExposure.map((c) => c.amountInr), 1)

  const typeDonutData: DonutDatum[] = overview.categories.map((c) => ({
    name: c.label,
    value: c.currentInr,
    color: c.color,
  }))

  const bestPerformer = overview.categories.reduce((best, c) => (c.gainPct > best.gainPct ? c : best))

  return (
    <>
      <div className={styles.topRow}>
        <KpiCard
          icon={TrendingUp}
          label="Current Value"
          value={formatDisplayAmount(overview.totalCurrentInr, displayCurrency, ratesMap)}
          badge={formatPct(overview.totalGainPct)}
          badgeTone={overview.totalGainPct}
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
          sublabel={formatPct(overview.totalGainPct)}
        />
        <KpiCard
          icon={Trophy}
          label="Best Performer"
          value={bestPerformer.label}
          badge={formatPct(bestPerformer.gainPct)}
          badgeTone={bestPerformer.gainPct}
        />
      </div>

      <div className={styles.portfolioRow}>
        <InvestedVsCurrentChart data={chartData} />
        <Card
          icon={Wallet}
          title="My Portfolio"
          actions={
            <Link to="/currency-converter" className={primitives.pillButton}>
              Currency Converter →
            </Link>
          }
        >
          <div className={styles.portfolioTotal}>
            {formatDisplayAmount(overview.totalCurrentInr, displayCurrency, ratesMap)}
          </div>
          <div className={primitives.mutedText}>{formatPct(overview.totalGainPct)} all-time</div>
          <div className={styles.allocationSection}>
            <AllocationBar segments={allocationSegments} />
            <AllocationLegend entries={allocationSegments} />
          </div>
        </Card>
      </div>

      <div className={styles.bottomRow}>
        <Card icon={PieChart} title="By Type" align="center">
          <AllocationDonut data={typeDonutData} />
        </Card>

        <Card icon={ListChecks} title="Top Holdings">
          <div className={styles.holdingsScroll}>
            {topHoldings.map((h) => (
              <div key={h.key} className={styles.holdingCard}>
                <div className={styles.holdingName}>{h.categoryLabel}</div>
                <div>{h.name}</div>
                <div className={styles.holdingValue}>{formatInr(h.currentInr)}</div>
                <div className={styles.gainTrack}>
                  <div
                    className={styles.gainFill}
                    style={{ width: `${Math.min(100, Math.max(4, Math.abs(h.gainPct) * 4))}%` }}
                  />
                </div>
                <div className={styles.holdingName}>{formatPct(h.gainPct)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card icon={ArrowLeftRight} title="Currency Exposure" align="center">
          <div className={styles.exposureList}>
            {currencyExposure.map((entry) => (
              <div key={entry.code} className={styles.exposureRow}>
                <span className={styles.exposureLeft}>
                  <span className={styles.exposureIcon}>{entry.code.slice(0, 2)}</span>
                  {entry.code}
                </span>
                <span className={styles.exposureBarTrack}>
                  <span
                    className={styles.exposureBarFill}
                    style={{ width: `${(entry.amountInr / maxExposure) * 100}%` }}
                  />
                </span>
                <span>{formatInr(entry.amountInr)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
