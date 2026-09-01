import type { DataManifest } from './types'

const BASE_URL = import.meta.env.BASE_URL

function withBase(path: string): string {
  return `${BASE_URL}${path.replace(/^\/+/, '')}`
}

function withBaseAll(manifest: DataManifest): DataManifest {
  return {
    currencyRates: withBase(manifest.currencyRates),
    usStocks: withBase(manifest.usStocks),
    indiaStocks: withBase(manifest.indiaStocks),
    mutualFunds: withBase(manifest.mutualFunds),
    esops: withBase(manifest.esops),
    savings: withBase(manifest.savings),
    fixedDeposits: withBase(manifest.fixedDeposits),
    pf: withBase(manifest.pf),
    pfStatements: withBase(manifest.pfStatements),
  }
}

export const MANIFEST_PATH = withBase('data/manifest.json')

export const DEFAULT_MANIFEST: DataManifest = {
  currencyRates: 'data/currency-rates.csv',
  usStocks: 'data/us-stocks.csv',
  indiaStocks: 'data/india-stocks.csv',
  mutualFunds: 'data/mutual-funds-india.csv',
  esops: 'data/esops.csv',
  savings: 'data/savings-accounts.csv',
  fixedDeposits: 'data/fixed-deposits.csv',
  pf: 'data/PF/account-summary.csv',
  pfStatements: 'data/PF/statements.csv',
}

export async function loadManifest(): Promise<DataManifest> {
  try {
    const res = await fetch(MANIFEST_PATH, { cache: 'no-store' })
    if (!res.ok) return withBaseAll(DEFAULT_MANIFEST)
    const partial = (await res.json()) as Partial<DataManifest>
    return withBaseAll({ ...DEFAULT_MANIFEST, ...partial })
  } catch {
    return withBaseAll(DEFAULT_MANIFEST)
  }
}
