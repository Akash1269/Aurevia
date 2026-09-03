import type { RatesMap } from './types'

// Frankfurter (frankfurter.dev) is free, keyless, CORS-enabled, and sourced
// from the European Central Bank - a good fit for a static client-only app
// where any API key would just be public anyway.
const LIVE_RATES_URL = 'https://api.frankfurter.dev/v1/latest?base=INR'

interface FrankfurterResponse {
  base: string
  date: string
  rates: Record<string, number>
}

export interface LiveRates {
  ratesMap: RatesMap
  asOf: string
}

export async function fetchLiveRates(): Promise<LiveRates> {
  const res = await fetch(LIVE_RATES_URL, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to fetch live rates: ${res.status}`)
  }
  const data = (await res.json()) as FrankfurterResponse

  // The API quotes "1 INR = X <code>" for a base=INR request, but the rest
  // of the app works in rate_to_inr terms ("1 <code> = X INR") - invert.
  const ratesMap: RatesMap = { INR: 1 }
  for (const [code, rateFromInr] of Object.entries(data.rates)) {
    if (rateFromInr > 0) {
      ratesMap[code] = 1 / rateFromInr
    }
  }
  return { ratesMap, asOf: data.date }
}
