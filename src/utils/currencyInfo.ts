const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' })

export function currencySymbolFor(code: string): string {
  try {
    const parts = new Intl.NumberFormat('en', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' }).formatToParts(1)
    return parts.find((p) => p.type === 'currency')?.value ?? code
  } catch {
    return code
  }
}

export function currencyNameFor(code: string): string {
  try {
    return currencyNames.of(code) ?? code
  } catch {
    return code
  }
}

export function currencyLabel(code: string): string {
  return `${code} — ${currencyNameFor(code)} (${currencySymbolFor(code)})`
}
