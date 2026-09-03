import { createContext, useContext } from 'react'
import type {
  CurrencyExposureEntry,
  Overview,
  PfStatementRow,
  PortfolioResults,
  RatesMap,
  TopHolding,
} from '../data/types'

export interface SupplementalState<T> {
  rows: T[]
  error: string | null
}

export interface RatesInfo {
  source: 'live' | 'csv'
  asOf: string | null
}

export interface PortfolioDataValue {
  loading: boolean
  ratesMap: RatesMap
  ratesInfo: RatesInfo
  results: PortfolioResults
  overview: Overview
  topHoldings: TopHolding[]
  currencyExposure: CurrencyExposureEntry[]
  pfStatements: SupplementalState<PfStatementRow>
  refresh: () => void
}

export const PortfolioDataContext = createContext<PortfolioDataValue | null>(null)

export function usePortfolioData(): PortfolioDataValue {
  const ctx = useContext(PortfolioDataContext)
  if (!ctx) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider')
  }
  return ctx
}
