import { CurrencyConverter } from '../components/CurrencyConverter'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { usePortfolioData } from '../context/PortfolioDataContext'
import primitives from '../styles/primitives.module.css'
import { formatInr } from '../utils/format'
import styles from './CategoryPage.module.css'

interface RateDisplayRow {
  displayName: string
  code: string
  rate: number
}

const columns: HoldingsColumn<RateDisplayRow>[] = [
  { key: 'code', label: 'Currency', render: (r) => r.code, sortValue: (r) => r.code },
  { key: 'rate', label: '1 unit = ₹', align: 'right', render: (r) => formatInr(r.rate), sortValue: (r) => r.rate },
]

export function CurrencyConverterPage() {
  const { ratesMap } = usePortfolioData()
  const rows: RateDisplayRow[] = Object.entries(ratesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, rate]) => ({ displayName: code, code, rate }))

  return (
    <div className={styles.body}>
      <div className={primitives.card}>
        <div className={primitives.cardTitle} style={{ marginBottom: 'var(--space-5)' }}>
          Reference Rates
        </div>
        <HoldingsTable columns={columns} rows={rows} />
      </div>
      <CurrencyConverter ratesMap={ratesMap} />
    </div>
  )
}
