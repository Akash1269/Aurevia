import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadCsv } from '../data/loadCsv'
import { fetchLiveRates } from '../data/liveRates'
import { loadManifest } from '../data/manifest'
import {
  buildOverview,
  computeEsops,
  computeFixedDeposits,
  computeIndiaStocks,
  computeMutualFunds,
  computePf,
  computeSavings,
  computeUsStocks,
  decoratePfStatements,
  getCurrencyExposure,
  getTopHoldings,
  ratesToMap,
} from '../data/portfolio'
import type {
  CategoryResult,
  CategoryTotals,
  CurrencyRateRow,
  EsopRow,
  FixedDepositRow,
  IndiaStockRow,
  MutualFundRow,
  PfStatementRawRow,
  PfStatementRow,
  PortfolioResults,
  RatesMap,
  SavingsRow,
  UsStockRow,
} from '../data/types'
import {
  PortfolioDataContext,
  type PortfolioDataValue,
  type RatesInfo,
  type SupplementalState,
} from './PortfolioDataContext'

function emptySupplemental<T>(): SupplementalState<T> {
  return { rows: [], error: null }
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

function fromSettledRaw<TRow, TDecorated>(
  settled: PromiseSettledResult<TRow[]>,
  decorate: (rows: TRow[]) => TDecorated[],
): SupplementalState<TDecorated> {
  if (settled.status === 'fulfilled') {
    return { rows: decorate(settled.value), error: null }
  }
  const message = settled.reason instanceof Error ? settled.reason.message : 'Failed to load data'
  return { rows: [], error: message }
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

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const [ratesMap, setRatesMap] = useState<RatesMap>({ INR: 1 })
  const [ratesInfo, setRatesInfo] = useState<RatesInfo>({ source: 'csv', asOf: null })
  const [results, setResults] = useState<PortfolioResults>(emptyResults)
  const [pfStatements, setPfStatements] = useState<SupplementalState<PfStatementRow>>(emptySupplemental)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const manifest = await loadManifest()
      if (cancelled) return

      const [
        ratesRes,
        usStocksRes,
        indiaStocksRes,
        mutualFundsRes,
        esopsRes,
        savingsRes,
        fixedDepositsRes,
        pfStatementsRes,
        liveRatesRes,
      ] = await Promise.allSettled([
        loadCsv<CurrencyRateRow>(manifest.currencyRates),
        loadCsv<UsStockRow>(manifest.usStocks),
        loadCsv<IndiaStockRow>(manifest.indiaStocks),
        loadCsv<MutualFundRow>(manifest.mutualFunds),
        loadCsv<EsopRow>(manifest.esops),
        loadCsv<SavingsRow>(manifest.savings),
        loadCsv<FixedDepositRow>(manifest.fixedDeposits),
        loadCsv<PfStatementRawRow>(manifest.pfStatements),
        fetchLiveRates(),
      ])

      if (cancelled) return

      // Live rates (Frankfurter, ECB-sourced) take priority; the CSV is only
      // a fallback for when the API is unreachable, so the app keeps working
      // offline or if the third party has an outage.
      let rates: RatesMap
      let info: RatesInfo
      if (liveRatesRes.status === 'fulfilled') {
        rates = liveRatesRes.value.ratesMap
        info = { source: 'live', asOf: liveRatesRes.value.asOf }
      } else {
        rates = ratesRes.status === 'fulfilled' ? ratesToMap(ratesRes.value) : { INR: 1 }
        info = { source: 'csv', asOf: null }
      }
      setRatesMap(rates)
      setRatesInfo(info)

      const statementsState = fromSettledRaw(pfStatementsRes, decoratePfStatements)

      setResults({
        usStocks: fromSettled(usStocksRes, (rows) => computeUsStocks(rows, rates)),
        indiaStocks: fromSettled(indiaStocksRes, (rows) => computeIndiaStocks(rows)),
        mutualFunds: fromSettled(mutualFundsRes, (rows) => computeMutualFunds(rows)),
        esops: fromSettled(esopsRes, (rows) => computeEsops(rows, rates)),
        savings: fromSettled(savingsRes, (rows) => computeSavings(rows, rates)),
        fixedDeposits: fromSettled(fixedDepositsRes, (rows) => computeFixedDeposits(rows, rates)),
        pf: statementsState.error
          ? { rows: [], totals: emptyTotals(), error: statementsState.error }
          : computePf(statementsState.rows),
      })

      setPfStatements(statementsState)

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
    () => ({
      loading,
      ratesMap,
      ratesInfo,
      results,
      overview,
      topHoldings,
      currencyExposure,
      pfStatements,
      refresh,
    }),
    [loading, ratesMap, ratesInfo, results, overview, topHoldings, currencyExposure, pfStatements, refresh],
  )

  return <PortfolioDataContext.Provider value={value}>{children}</PortfolioDataContext.Provider>
}
