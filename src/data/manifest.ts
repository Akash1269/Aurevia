import type { DataManifest } from './types'

export const MANIFEST_PATH = '/data/manifest.json'

export const DEFAULT_MANIFEST: DataManifest = {
  currencyRates: '/data/currency-rates.csv',
  usStocks: '/data/us-stocks.csv',
  indiaStocks: '/data/india-stocks.csv',
  mutualFunds: '/data/mutual-funds-india.csv',
  esops: '/data/esops.csv',
  savings: '/data/savings-accounts.csv',
  fixedDeposits: '/data/fixed-deposits.csv',
  pf: '/data/PF/account-summary.csv',
  pfContributions: '/data/PF/contributions.csv',
}

export async function loadManifest(): Promise<DataManifest> {
  try {
    const res = await fetch(MANIFEST_PATH, { cache: 'no-store' })
    if (!res.ok) return DEFAULT_MANIFEST
    const partial = (await res.json()) as Partial<DataManifest>
    return { ...DEFAULT_MANIFEST, ...partial }
  } catch {
    return DEFAULT_MANIFEST
  }
}
