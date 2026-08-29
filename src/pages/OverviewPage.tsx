import { Link } from 'react-router-dom'
import { AllocationBar } from '../components/AllocationBar'
import { AllocationLegend } from '../components/AllocationLegend'
import { TrendDownIcon, TrendUpIcon, WalletIcon } from '../components/icons'
import { InvestedVsCurrentChart, type InvestedVsCurrentDatum } from '../components/InvestedVsCurrentChart'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import primitives from '../styles/primitives.module.css'
import { formatInr, formatPct } from '../utils/format'
import styles from './OverviewPage.module.css'

export function OverviewPage() {
  const { overview, topHoldings, currencyExposure } = usePortfolioData()

  const allocationSegments = overview.categories.map((c) => ({
    label: c.label,
    pct: c.pct,
    amountInr: c.currentInr,
    color: c.color,
  }))

  const chartData: InvestedVsCurrentDatum[] = overview.categories.map((c) => ({
    label: c.label.replace(' Accounts', '').replace(' Deposits', ''),
    invested: c.investedInr,
    current: c.currentInr,
    gainPct: c.gainPct,
  }))

  const maxExposure = Math.max(...currencyExposure.map((c) => c.amountInr), 1)

  return (
    <>
      <div className={styles.topRow}>
        <KpiCard
          icon={TrendUpIcon}
          label="Current Value"
          value={formatInr(overview.totalCurrentInr)}
          badge={formatPct(overview.totalGainPct)}
        />
        <KpiCard icon={WalletIcon} label="Total Invested" value={formatInr(overview.totalInvestedInr)} />
        <KpiCard
          icon={overview.totalGainInr >= 0 ? TrendUpIcon : TrendDownIcon}
          label="Overall Gain / Loss"
          value={formatInr(overview.totalGainInr)}
          sublabel={formatPct(overview.totalGainPct)}
        />
        <div className={`${primitives.card} ${styles.portfolioCard}`}>
          <div className={styles.portfolioHeader}>
            <span className={primitives.cardTitle}>My Portfolio</span>
            <Link to="/currency-converter" className={primitives.pillButton}>
              Currency Converter →
            </Link>
          </div>
          <div className={styles.portfolioTotal}>{formatInr(overview.totalCurrentInr)}</div>
          <div className={primitives.mutedText}>{formatPct(overview.totalGainPct)} all-time</div>
          <div style={{ marginTop: 20 }}>
            <AllocationBar segments={allocationSegments} />
            <AllocationLegend entries={allocationSegments} />
          </div>
        </div>
      </div>

      <InvestedVsCurrentChart data={chartData} />

      <div className={styles.bottomRow}>
        <div className={`${primitives.card} ${styles.listCard}`}>
          <div className={primitives.cardTitle}>Category Breakdown</div>
          {overview.categories.map((c) => (
            <div key={c.key} className={styles.rankRow}>
              <span className={styles.rankLeft}>
                <span className={styles.rankDot} style={{ background: c.color }} />
                {c.label}
              </span>
              <span className={styles.rankRight}>
                <span>{formatInr(c.currentInr)}</span>
                <span className={primitives.mutedText}>{formatPct(c.gainPct)}</span>
              </span>
            </div>
          ))}
        </div>

        <div className={`${primitives.card} ${styles.listCard}`}>
          <div className={primitives.cardTitle}>Top Holdings</div>
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
        </div>

        <div className={`${primitives.card} ${styles.listCard}`}>
          <div className={primitives.cardTitle}>Currency Exposure</div>
          {currencyExposure.map((entry) => (
            <div key={entry.code} className={styles.exposureRow}>
              <span className={styles.exposureLeft}>
                <span className={styles.exposureIcon}>{entry.code.slice(0, 2)}</span>
                {entry.code}
              </span>
              <span className={styles.exposureBarTrack}>
                <span className={styles.exposureBarFill} style={{ width: `${(entry.amountInr / maxExposure) * 100}%` }} />
              </span>
              <span>{formatInr(entry.amountInr)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
