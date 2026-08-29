import { useMemo, useState } from 'react'
import { toInr } from '../data/portfolio'
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
    <div className={primitives.card}>
      <div className={primitives.cardTitle} style={{ marginBottom: 20 }}>
        Currency Converter
      </div>
      <div className={styles.row}>
        <input
          type="number"
          className={styles.input}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
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
    </div>
  )
}
