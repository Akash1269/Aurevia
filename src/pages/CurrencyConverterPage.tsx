import { Card } from '../components/Card'
import { CurrencyConverter } from '../components/CurrencyConverter'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { Coins } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { useSettings } from '../context/SettingsContext'
import { fromInr } from '../data/portfolio'
import type { RatesMap } from '../data/types'
import primitives from '../styles/primitives.module.css'
import { currencyNameFor, currencySymbolFor } from '../utils/currencyInfo'
import styles from './CategoryPage.module.css'

interface RateDisplayRow {
  displayName: string
  code: string
  rate: number
}

// Preference order for the "top currencies" KPI row - the classic majors,
// with enough backups to still fill 4 cards if the current display currency
// (or the CSV fallback's smaller rate set) knocks one or two out.
const MAJOR_CURRENCY_CANDIDATES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF']

// Unlike portfolio totals, unit conversion rates can be well under 1 (e.g.
// 1 JPY is a fraction of a rupee) - the portfolio-scale formatters round to
// 0-2dp and would show those as a flat 0 or a misleadingly rounded whole
// number, so this keeps enough precision to stay meaningful for any target
// currency.
function formatUnitRate(value: number, currencyCode: string): string {
  const symbol = currencySymbolFor(currencyCode)
  return `${symbol}${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
}

// r.rate is always INR-denominated (RatesMap's rate_to_inr convention), so
// the "1 unit = ..." column converts it into whichever currency is set as
// the app's default before formatting/sorting.
function buildColumns(displayCurrency: string, ratesMap: RatesMap): HoldingsColumn<RateDisplayRow>[] {
  const rateInDisplayCurrency = (r: RateDisplayRow) => fromInr(r.rate, displayCurrency, ratesMap)
  return [
    { key: 'code', label: 'Currency', render: (r) => r.code, sortValue: (r) => r.code },
    {
      key: 'name',
      label: 'Name',
      render: (r) => `${currencyNameFor(r.code)} (${currencySymbolFor(r.code)})`,
      sortValue: (r) => currencyNameFor(r.code),
      truncate: '220px',
      title: (r) => `${currencyNameFor(r.code)} (${currencySymbolFor(r.code)})`,
    },
    {
      key: 'rate',
      label: `1 unit = ${currencySymbolFor(displayCurrency)}`,
      align: 'right',
      render: (r) => formatUnitRate(rateInDisplayCurrency(r), displayCurrency),
      sortValue: rateInDisplayCurrency,
    },
  ]
}

export function CurrencyConverterPage() {
  const { ratesMap, ratesInfo } = usePortfolioData()
  const { displayCurrency } = useSettings()
  const rows: RateDisplayRow[] = Object.entries(ratesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, rate]) => ({ displayName: code, code, rate }))

  const topCurrencies = MAJOR_CURRENCY_CANDIDATES.filter((code) => code !== displayCurrency && ratesMap[code] !== undefined).slice(0, 4)
  const columns = buildColumns(displayCurrency, ratesMap)

  return (
    <>
      <CurrencyConverter ratesMap={ratesMap} />
      {topCurrencies.length > 0 && (
        <div className={styles.kpiRow}>
          {topCurrencies.map((code) => {
            const rate = (ratesMap[code] ?? 0) / (ratesMap[displayCurrency] ?? 1)
            return (
              <KpiCard
                key={code}
                icon={Coins}
                label={`1 ${code}`}
                value={formatUnitRate(rate, displayCurrency)}
                sublabel={currencyNameFor(code)}
              />
            )
          })}
        </div>
      )}
      <Card
        icon={Coins}
        title="Reference Rates"
        actions={
          <span className={primitives.mutedText}>
            Default: {displayCurrency} ·{' '}
            {ratesInfo.source === 'live' ? `Live rates · ${ratesInfo.asOf}` : 'Fallback rates (live rates unavailable)'}
          </span>
        }
      >
        <HoldingsTable columns={columns} rows={rows} />
      </Card>
    </>
  )
}
