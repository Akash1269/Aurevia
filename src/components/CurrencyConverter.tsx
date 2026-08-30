import { useMemo, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { Card } from './Card'
import { toInr } from '../data/portfolio'
import { NumberStepper } from './NumberStepper'
import type { RatesMap } from '../data/types'
import primitives from '../styles/primitives.module.css'
import styles from './CurrencyConverter.module.css'

export function CurrencyConverter({ ratesMap }: { ratesMap: RatesMap }) {
  const codes = useMemo(() => Object.keys(ratesMap).sort(), [ratesMap])
  const [amount, setAmount] = useState(1000)
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('INR')

  const amountInInr = toInr(amount, from, ratesMap)
  const result = to === 'INR' ? amountInInr : amountInInr / (ratesMap[to] ?? 1)
  const unitRate = (ratesMap[from] ?? 0) / (ratesMap[to] ?? 1)

  return (
    <Card icon={ArrowLeftRight} title="Currency Converter">
      <div className={styles.row}>
        <NumberStepper className={styles.amountStepper} value={amount} min={0} onChange={setAmount} aria-label="Amount" />
        <select className={styles.select} value={from} onChange={(e) => setFrom(e.target.value)}>
          {codes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <span className={styles.arrow}>→</span>
        <select className={styles.select} value={to} onChange={(e) => setTo(e.target.value)}>
          {codes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.resultRow}>
        <span className={primitives.bigNumber}>
          {result.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {to}
        </span>
        <span className={primitives.mutedText}>
          1 {from} = {unitRate.toFixed(4)} {to}
        </span>
      </div>
    </Card>
  )
}
