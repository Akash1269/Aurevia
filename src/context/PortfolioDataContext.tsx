import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadCsv } from '../data/loadCsv'
import {
  RATES_PATH,
  buildOverview,
  computeEsops,
  computeFixedDeposits,
  computeIndiaStocks,
  computeMutualFunds,
  computePf,
  computeSavings,
  computeUsStocks,
  getCurrencyExposure,
  getTopHoldings,
  ratesToMap,
} from '../data/portfolio'
import type {
  CategoryResult,
  CategoryTotals,
  CurrencyExposureEntry,
  CurrencyRateRow,
  EsopRow,
  FixedDepositRow,
  IndiaStockRow,
  MutualFundRow,
  Overview,
  PfRow,
  PortfolioResults,
  RatesMap,
  SavingsRow,
  TopHolding,
  UsStockRow,
} from '../data/types'

interface PortfolioDataValue {
  loading: boolean
  ratesMap: RatesMap
  results: PortfolioResults
  overview: Overview
  topHoldings: TopHolding[]
  currencyExposure: CurrencyExposureEntry[]
  refresh: () => void
}

function emptyTotals(): CategoryTotals {
  return { invested: 0, current: 0, gain: 0, gainPct: 0, investedInr: 0, currentInr: 0, gainInr: 0 }
}

function emptyResult<T>(): CategoryResult<T> {
  return { rows: [], totals: emptyTotals(), error: null }
}

function emptyResults(): PortfolioResults {
  return {
    usStocks: emptyResult(),
    indiaStocks: emptyResult(),
    mutualFunds: emptyResult(),
    esops: emptyResult(),
    savings: emptyResult(),
    fixedDeposits: emptyResult(),
    pf: emptyResult(),
  }
}

function fromSettled<TRow, TComputed>(
  settled: PromiseSettledResult<TRow[]>,
  compute: (rows: TRow[]) => CategoryResult<TComputed>,
): CategoryResult<TComputed> {
  if (settled.status === 'fulfilled') {
    return compute(settled.value)
  }
  const message = settled.reason instanceof Error ? settled.reason.message : 'Failed to load data'
  return { rows: [], totals: emptyTotals(), error: message }
}

const PortfolioDataContext = createContext<PortfolioDataValue | null>(null)

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const [ratesMap, setRatesMap] = useState<RatesMap>({ INR: 1 })
  const [results, setResults] = useState<PortfolioResults>(emptyResults)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [ratesRes, usStocksRes, indiaStocksRes, mutualFundsRes, esopsRes, savingsRes, fixedDepositsRes, pfRes] =
        await Promise.allSettled([
          loadCsv<CurrencyRateRow>(RATES_PATH),
          loadCsv<UsStockRow>('/data/us-stocks.csv'),
          loadCsv<IndiaStockRow>('/data/india-stocks.csv'),
          loadCsv<MutualFundRow>('/data/mutual-funds-india.csv'),
          loadCsv<EsopRow>('/data/esops.csv'),
          loadCsv<SavingsRow>('/data/savings-accounts.csv'),
          loadCsv<FixedDepositRow>('/data/fixed-deposits.csv'),
          loadCsv<PfRow>('/data/india-pf.csv'),
        ])

      if (cancelled) return

      const rates = ratesRes.status === 'fulfilled' ? ratesToMap(ratesRes.value) : { INR: 1 }
      setRatesMap(rates)

      setResults({
        usStocks: fromSettled(usStocksRes, (rows) => computeUsStocks(rows, rates)),
        indiaStocks: fromSettled(indiaStocksRes, (rows) => computeIndiaStocks(rows)),
        mutualFunds: fromSettled(mutualFundsRes, (rows) => computeMutualFunds(rows)),
        esops: fromSettled(esopsRes, (rows) => computeEsops(rows, rates)),
        savings: fromSettled(savingsRes, (rows) => computeSavings(rows, rates)),
        fixedDeposits: fromSettled(fixedDepositsRes, (rows) => computeFixedDeposits(rows, rates)),
        pf: fromSettled(pfRes, (rows) => computePf(rows)),
      })
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [version])

  const refresh = useCallback(() => {
    setLoading(true)
    setVersion((v) => v + 1)
  }, [])

  const overview = useMemo(() => buildOverview(results), [results])
  const topHoldings = useMemo(() => getTopHoldings(results), [results])
  const currencyExposure = useMemo(() => getCurrencyExposure(results), [results])

  const value = useMemo<PortfolioDataValue>(
    () => ({ loading, ratesMap, results, overview, topHoldings, currencyExposure, refresh }),
    [loading, ratesMap, results, overview, topHoldings, currencyExposure, refresh],
  )

  return <PortfolioDataContext.Provider value={value}>{children}</PortfolioDataContext.Provider>
}

export function usePortfolioData(): PortfolioDataValue {
  const ctx = useContext(PortfolioDataContext)
  if (!ctx) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider')
  }
  return ctx
}
