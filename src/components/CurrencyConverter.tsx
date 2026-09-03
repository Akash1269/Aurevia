import { useMemo, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { Card } from './Card'
import { useSettings } from '../context/SettingsContext'
import { toInr } from '../data/portfolio'
import { NumberStepper } from './NumberStepper'
import type { RatesMap } from '../data/types'
import { currencyLabel, currencyNameFor, currencySymbolFor } from '../utils/currencyInfo'
import styles from './CurrencyConverter.module.css'

type Side = 'from' | 'to'

function convertAmount(amount: number, fromCode: string, toCode: string, ratesMap: RatesMap): number {
  const amountInInr = toInr(amount, fromCode, ratesMap)
  const converted = toCode === 'INR' ? amountInInr : amountInInr / (ratesMap[toCode] ?? 1)
  return Math.round(converted * 100) / 100
}

export function CurrencyConverter({ ratesMap }: { ratesMap: RatesMap }) {
  const { displayCurrency } = useSettings()
  const codes = useMemo(() => Object.keys(ratesMap).sort(), [ratesMap])
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('INR')
  // Whichever side the person last typed into stays exactly as typed; the
  // other side is always derived fresh from it (and the live rates), so
  // switching a currency never round-trips a value through repeated
  // conversions and drifts.
  const [editedSide, setEditedSide] = useState<Side>('from')
  const [editedAmount, setEditedAmount] = useState(1000)

  const fromAmount = editedSide === 'from' ? editedAmount : convertAmount(editedAmount, to, from, ratesMap)
  const toAmount = editedSide === 'to' ? editedAmount : convertAmount(editedAmount, from, to, ratesMap)
  const unitRate = (ratesMap[from] ?? 0) / (ratesMap[to] ?? 1)

  function swap() {
    setFrom(to)
    setTo(from)
    setEditedSide('from')
    setEditedAmount(toAmount)
  }

  return (
    <Card icon={ArrowLeftRight} title="Currency Converter">
      <div className={styles.layout}>
        <div className={styles.inputsArea}>
          <div className={styles.side}>
            <label className={styles.fieldLabel} htmlFor="cc-from-amount">
              From
            </label>
            <div className={styles.inputGroup}>
              <NumberStepper
                id="cc-from-amount"
                className={styles.amountStepper}
                value={fromAmount}
                min={0}
                onChange={(value) => {
                  setEditedSide('from')
                  setEditedAmount(value)
                }}
                aria-label="From amount"
              />
              <select className={styles.select} value={from} onChange={(e) => setFrom(e.target.value)}>
                {codes.map((code) => (
                  <option key={code} value={code}>
                    {currencyLabel(code)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className={styles.swapButton}
            onClick={swap}
            title="Swap currencies"
            aria-label="Swap currencies"
          >
            <ArrowLeftRight size={16} />
          </button>

          <div className={styles.side}>
            <label className={styles.fieldLabel} htmlFor="cc-to-amount">
              To
            </label>
            <div className={styles.inputGroup}>
              <NumberStepper
                id="cc-to-amount"
                className={styles.amountStepper}
                value={toAmount}
                min={0}
                onChange={(value) => {
                  setEditedSide('to')
                  setEditedAmount(value)
                }}
                aria-label="To amount"
              />
              <select className={styles.select} value={to} onChange={(e) => setTo(e.target.value)}>
                {codes.map((code) => (
                  <option key={code} value={code}>
                    {currencyLabel(code)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.rateArea}>
          <span className={styles.defaultCurrency}>
            Default: {displayCurrency} ({currencySymbolFor(displayCurrency)}) · {currencyNameFor(displayCurrency)}
          </span>
          <span className={styles.rateLabel}>Exchange rate</span>
          <span className={styles.rateValue}>
            1 {from} = {unitRate.toFixed(4)} {to}
          </span>
        </div>
      </div>
    </Card>
  )
}
