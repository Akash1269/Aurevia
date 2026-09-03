import { useMemo, useState } from 'react'
import {
  Briefcase,
  CandlestickChart,
  Landmark,
  Layers,
  Lock,
  Percent,
  RotateCcw,
  Shield,
  Sliders,
  TrendingUp,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '../components/Card'
import { colorForIndex } from '../utils/colors'
import { GainText } from '../components/GainText'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { KpiCard } from '../components/KpiCard'
import { NumberStepper } from '../components/NumberStepper'
import { ProjectionChart, type ProjectionSeriesDef, type ProjectionStackPoint } from '../components/ProjectionChart'
import { usePortfolioData } from '../context/PortfolioDataContext'
import type { PortfolioResults } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { formatInr, formatPct, formatSignedInr } from '../utils/format'
import categoryStyles from './CategoryPage.module.css'
import styles from './ProjectionsPage.module.css'

const DEFAULT_TENURE = 10
const TENURE_PRESETS = [10, 15, 20]

interface CategoryDef {
  key: keyof PortfolioResults
  label: string
  icon: LucideIcon
  fallbackRate: number
}

const CATEGORY_DEFS: CategoryDef[] = [
  { key: 'usStocks', label: 'US Stocks', icon: TrendingUp, fallbackRate: 10 },
  { key: 'indiaStocks', label: 'India Stocks', icon: CandlestickChart, fallbackRate: 12 },
  { key: 'mutualFunds', label: 'Mutual Funds', icon: Layers, fallbackRate: 10 },
  { key: 'esops', label: 'ESOPs', icon: Briefcase, fallbackRate: 15 },
  { key: 'savings', label: 'Savings Accounts', icon: Landmark, fallbackRate: 3.5 },
  { key: 'fixedDeposits', label: 'Fixed Deposits', icon: Lock, fallbackRate: 7 },
  { key: 'pf', label: 'India PF', icon: Shield, fallbackRate: 8.15 },
]

interface ProjectionRow {
  key: string
  displayName: string
  currentInr: number
  defaultRate: number
}

function weightedInterestRate(rows: { interest_rate_pct: number; currentInr: number }[], totalInr: number): number {
  if (totalInr === 0) return 0
  return rows.reduce((sum, r) => sum + r.interest_rate_pct * r.currentInr, 0) / totalInr
}

function projectedValue(currentInr: number, ratePct: number, years: number): number {
  return currentInr * (1 + ratePct / 100) ** years
}

export function ProjectionsPage() {
  const { results } = usePortfolioData()
  const [tenure, setTenure] = useState(DEFAULT_TENURE)
  const [rateOverrides, setRateOverrides] = useState<Record<string, number>>({})
  const [settingsOpen, setSettingsOpen] = useState(false)

  const categories: ProjectionRow[] = useMemo(() => {
    const savingsRate = weightedInterestRate(results.savings.rows, results.savings.totals.currentInr)
    const fdRate = weightedInterestRate(results.fixedDeposits.rows, results.fixedDeposits.totals.currentInr)

    return CATEGORY_DEFS.map((def) => {
      let defaultRate = def.fallbackRate
      if (def.key === 'savings' && savingsRate > 0) defaultRate = savingsRate
      if (def.key === 'fixedDeposits' && fdRate > 0) defaultRate = fdRate
      return {
        key: def.key,
        displayName: def.label,
        currentInr: results[def.key].totals.currentInr,
        defaultRate: Math.round(defaultRate * 100) / 100,
      }
    })
  }, [results])

  const rateFor = (row: ProjectionRow) => rateOverrides[row.key] ?? row.defaultRate

  const totalCurrent = categories.reduce((sum, c) => sum + c.currentInr, 0)
  const totalProjected = categories.reduce((sum, c) => sum + projectedValue(c.currentInr, rateFor(c), tenure), 0)
  const totalGrowth = totalProjected - totalCurrent
  const totalGrowthPct = totalCurrent === 0 ? 0 : (totalGrowth / totalCurrent) * 100
  const blendedCagr =
    totalCurrent === 0 || tenure === 0 ? 0 : ((totalProjected / totalCurrent) ** (1 / tenure) - 1) * 100

  const series: ProjectionSeriesDef[] = useMemo(
    () => categories.map((c, i) => ({ key: c.key, label: c.displayName, color: colorForIndex(i) })),
    [categories],
  )

  const chartData: ProjectionStackPoint[] = useMemo(() => {
    return Array.from({ length: tenure + 1 }, (_, year) => {
      const point: ProjectionStackPoint = { label: year === 0 ? 'Today' : `Yr ${year}`, total: 0 }
      for (const c of categories) {
        const value = projectedValue(c.currentInr, rateOverrides[c.key] ?? c.defaultRate, year)
        point[c.key] = value
        point.total += value
      }
      return point
    })
  }, [categories, tenure, rateOverrides])

  const columns: HoldingsColumn<ProjectionRow>[] = [
    { key: 'category', label: 'Category', render: (r) => r.displayName, sortValue: (r) => r.displayName },
    {
      key: 'current',
      label: 'Current Value',
      align: 'right',
      render: (r) => formatInr(r.currentInr),
      sortValue: (r) => r.currentInr,
    },
    {
      key: 'rate',
      label: 'Growth % (YoY)',
      align: 'right',
      render: (r) => (
        <NumberStepper
          className={styles.rateStepper}
          size="sm"
          value={rateFor(r)}
          step={0.1}
          onChange={(next) => setRateOverrides((prev) => ({ ...prev, [r.key]: next }))}
          aria-label={`${r.displayName} projected growth rate`}
        />
      ),
      sortValue: (r) => rateFor(r),
    },
    {
      key: 'projected',
      label: `Projected Value (Yr ${tenure})`,
      align: 'right',
      render: (r) => formatInr(projectedValue(r.currentInr, rateFor(r), tenure)),
      sortValue: (r) => projectedValue(r.currentInr, rateFor(r), tenure),
    },
    {
      key: 'growth',
      label: 'Growth',
      align: 'right',
      render: (r) => {
        const growth = projectedValue(r.currentInr, rateFor(r), tenure) - r.currentInr
        return <GainText value={growth}>{formatSignedInr(growth)}</GainText>
      },
      sortValue: (r) => projectedValue(r.currentInr, rateFor(r), tenure) - r.currentInr,
    },
  ]

  function handleReset() {
    setTenure(DEFAULT_TENURE)
    setRateOverrides({})
  }

  return (
    <>
      <div className={styles.configRow}>
        <button
          type="button"
          className={`${primitives.pillButtonLight} ${styles.configButton}`}
          onClick={() => setSettingsOpen((open) => !open)}
          aria-expanded={settingsOpen}
        >
          <Sliders size={14} />
          Configure projection
        </button>
      </div>

      {settingsOpen && (
        <Card
          icon={Sliders}
          title="Projection Settings"
          actions={
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setSettingsOpen(false)}
              aria-label="Close settings"
            >
              <X size={16} />
            </button>
          }
        >
          <div className={styles.controls}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Tenure (years)</span>
              <div className={styles.presetGroup}>
                {TENURE_PRESETS.map((years) => (
                  <button
                    key={years}
                    type="button"
                    className={`${styles.presetButton} ${tenure === years ? styles.presetButtonActive : ''}`}
                    onClick={() => setTenure(years)}
                  >
                    {years}Y
                  </button>
                ))}
                <NumberStepper
                  id="projection-tenure"
                  className={styles.tenureStepper}
                  value={tenure}
                  min={1}
                  max={40}
                  onChange={setTenure}
                  aria-label="Custom tenure in years"
                />
              </div>
            </div>
            <button
              type="button"
              className={`${primitives.pillButtonLight} ${styles.resetButton}`}
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              Reset to defaults
            </button>
          </div>
        </Card>
      )}

      <div className={categoryStyles.kpiRow}>
        <KpiCard
          icon={Wallet}
          label="Current Value"
          value={formatInr(totalCurrent)}
          sublabel={`across ${categories.length} categories`}
        />
        <KpiCard
          icon={TrendingUp}
          label="Projected Value"
          value={formatInr(totalProjected)}
          sublabel={`in ${tenure} year${tenure === 1 ? '' : 's'}`}
        />
        <KpiCard
          icon={totalGrowth >= 0 ? TrendingUp : Percent}
          label="Total Growth"
          value={formatSignedInr(totalGrowth)}
          badge={formatPct(totalGrowthPct)}
          badgeTone={totalGrowthPct}
          sublabel={`over ${tenure} year${tenure === 1 ? '' : 's'}`}
        />
        <KpiCard icon={Percent} label="Blended CAGR" value={formatPct(blendedCagr)} sublabel="annualized return" />
      </div>

      <ProjectionChart data={chartData} series={series} />

      <Card title="Category Breakdown">
        <HoldingsTable columns={columns} rows={categories} />
      </Card>
    </>
  )
}
