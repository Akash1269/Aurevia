import { Card } from '../components/Card'
import { CurrencyConverter } from '../components/CurrencyConverter'
import { HoldingsTable, type HoldingsColumn } from '../components/HoldingsTable'
import { Coins } from 'lucide-react'
import { usePortfolioData } from '../context/PortfolioDataContext'
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
      <Card icon={Coins} title="Reference Rates">
        <HoldingsTable columns={columns} rows={rows} />
      </Card>
      <CurrencyConverter ratesMap={ratesMap} />
    </div>
  )
}
