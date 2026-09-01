const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const pctFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

const signedNumberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
})

const compactInrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const compactUsdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatInr(value: number): string {
  return inrFormatter.format(value)
}

export function formatCompactInr(value: number): string {
  return compactInrFormatter.format(value)
}

export function formatUsd(value: number): string {
  return usdFormatter.format(value)
}

export function formatCompactUsd(value: number): string {
  return compactUsdFormatter.format(value)
}

export function formatCurrency(value: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPct(value: number): string {
  return pctFormatter.format(value / 100)
}

export function formatSignedInr(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${inrFormatter.format(Math.abs(value))}`
}

export function formatSignedNumber(value: number): string {
  return signedNumberFormatter.format(value)
}

export function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const MONTH_ABBREVIATIONS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

// Never fall back to the native Date parser for either shape: for "Jun-18" it
// reads month/day/2-digit-year and silently produces the wrong year (e.g.
// "Jun-18" -> day 18, year 2001) instead of erroring, so both formats are
// parsed explicitly here.
function parseMonth(value: string): Date | null {
  const trimmed = value.trim()

  // "2026-06" (ISO year-month)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})$/)
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, 1)
  }

  // "Jun-18" (month abbreviation + 2-digit year)
  const mmmYyMatch = trimmed.match(/^([A-Za-z]{3,})-(\d{2})$/)
  if (mmmYyMatch) {
    const monthIndex = MONTH_ABBREVIATIONS[mmmYyMatch[1].slice(0, 3).toLowerCase()]
    if (monthIndex !== undefined) {
      return new Date(2000 + Number(mmmYyMatch[2]), monthIndex, 1)
    }
  }

  // "31/03/2020" (day/month/year)
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmyMatch) {
    return new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]))
  }

  return null
}

export function formatMonth(value: string): string {
  const date = parseMonth(value)
  return date ? date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : value.trim()
}

export function monthSortKey(value: string): number {
  return parseMonth(value)?.getTime() ?? 0
}
