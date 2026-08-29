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

export function formatInr(value: number): string {
  return inrFormatter.format(value)
}

export function formatUsd(value: number): string {
  return usdFormatter.format(value)
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
