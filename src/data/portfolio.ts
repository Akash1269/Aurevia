import type {
  CategoryResult,
  CategoryTotals,
  ComputedEsop,
  ComputedFixedDeposit,
  ComputedIndiaStock,
  ComputedMutualFund,
  ComputedPf,
  ComputedSavings,
  ComputedUsStock,
  CurrencyExposureEntry,
  CurrencyRateRow,
  EsopRow,
  FixedDepositRow,
  IndiaStockRow,
  MutualFundRow,
  Overview,
  OverviewCategory,
  PfAccountSummaryRawRow,
  PfEntryType,
  PfStatementRawRow,
  PfStatementRow,
  PortfolioResults,
  RatesMap,
  SavingsRow,
  TopHolding,
  UsStockRow,
} from './types'

export interface CategoryMetaEntry {
  key: string
  label: string
  color: string
}

export const CATEGORY_META: CategoryMetaEntry[] = [
  { key: 'usStocks', label: 'US Stocks', color: 'var(--alloc-1)' },
  { key: 'indiaStocks', label: 'India Stocks', color: 'var(--alloc-2)' },
  { key: 'mutualFunds', label: 'Mutual Funds', color: 'var(--alloc-3)' },
  { key: 'esops', label: 'ESOPs', color: 'var(--alloc-4)' },
  { key: 'savings', label: 'Savings Accounts', color: 'var(--alloc-5)' },
  { key: 'fixedDeposits', label: 'Fixed Deposits', color: 'var(--alloc-6)' },
  { key: 'pf', label: 'India PF', color: 'var(--alloc-7)' },
]

// CSV cells are often hand-padded with spaces for column alignment; a blank
// numeric cell then parses as a whitespace string rather than null, and
// `?? 0` doesn't catch that. Normalize defensively so stray padding can't
// silently turn a total into NaN.
function toNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function decoratePfStatements(rows: PfStatementRawRow[]): PfStatementRow[] {
  return rows
    .filter((row) => row.company && String(row.company).trim() && row.month && String(row.month).trim())
    .map((row) => {
      const company = String(row.company).trim()
      const month = String(row.month).trim()
      const transaction_date = String(row.transaction_date ?? '').trim()
      const type = String(row.type).trim() as PfEntryType
      const employee = toNullableNumber(row.employee) ?? 0
      const employer = toNullableNumber(row.employer) ?? 0
      const pension = toNullableNumber(row.pension)
      const notes = row.notes != null ? String(row.notes).trim() : ''
      return {
        company,
        month,
        transaction_date,
        type,
        employee,
        employer,
        pension,
        notes,
        displayName: `${company} · ${month} · ${type}`,
        total: employee + employer + (pension ?? 0),
      }
    })
}

export function ratesToMap(rows: CurrencyRateRow[]): RatesMap {
  const map: RatesMap = { INR: 1 }
  for (const row of rows) {
    if (row.currency_code) {
      map[row.currency_code] = row.rate_to_inr
    }
  }
  return map
}

export function toInr(amount: number, currencyCode: string, ratesMap: RatesMap): number {
  const rate = ratesMap[currencyCode] ?? 1
  return amount * rate
}

function gainPctOf(invested: number, gain: number): number {
  return invested === 0 ? 0 : (gain / invested) * 100
}

function sumTotals(rows: { invested: number; current: number; investedInr: number; currentInr: number }[]): CategoryTotals {
  const invested = rows.reduce((sum, r) => sum + r.invested, 0)
  const current = rows.reduce((sum, r) => sum + r.current, 0)
  const investedInr = rows.reduce((sum, r) => sum + r.investedInr, 0)
  const currentInr = rows.reduce((sum, r) => sum + r.currentInr, 0)
  const gain = current - invested
  const gainInr = currentInr - investedInr
  return {
    invested,
    current,
    gain,
    gainPct: gainPctOf(invested, gain),
    investedInr,
    currentInr,
    gainInr,
  }
}

export function computeUsStocks(rows: UsStockRow[], ratesMap: RatesMap): CategoryResult<ComputedUsStock> {
  const computed = rows.map((row) => {
    const invested = row.quantity * row.avg_buy_price_usd
    const current = row.quantity * row.current_price_usd
    const gain = current - invested
    const investedInr = toInr(invested, 'USD', ratesMap)
    const currentInr = toInr(current, 'USD', ratesMap)
    return {
      ...row,
      displayName: `${row.symbol} · ${row.name}`,
      invested,
      current,
      gain,
      gainPct: gainPctOf(invested, gain),
      investedInr,
      currentInr,
      gainInr: currentInr - investedInr,
    }
  })
  return { rows: computed, totals: sumTotals(computed), error: null }
}

export function computeIndiaStocks(rows: IndiaStockRow[]): CategoryResult<ComputedIndiaStock> {
  const computed = rows.map((row) => {
    const invested = row.quantity * row.avg_buy_price_inr
    const current = row.quantity * row.current_price_inr
    const gain = current - invested
    return {
      ...row,
      displayName: `${row.symbol} · ${row.name}`,
      invested,
      current,
      gain,
      gainPct: gainPctOf(invested, gain),
      investedInr: invested,
      currentInr: current,
      gainInr: gain,
    }
  })
  return { rows: computed, totals: sumTotals(computed), error: null }
}

export function computeMutualFunds(rows: MutualFundRow[]): CategoryResult<ComputedMutualFund> {
  const computed = rows.map((row) => {
    const invested = row.units * row.avg_nav
    const current = row.units * row.current_nav
    const gain = current - invested
    return {
      ...row,
      displayName: row.fund_name,
      invested,
      current,
      gain,
      gainPct: gainPctOf(invested, gain),
      investedInr: invested,
      currentInr: current,
      gainInr: gain,
    }
  })
  return { rows: computed, totals: sumTotals(computed), error: null }
}

export function computeEsops(rows: EsopRow[], ratesMap: RatesMap): CategoryResult<ComputedEsop> {
  const computed = rows.map((row) => {
    const invested = row.quantity * row.avg_purchase_price
    const current = row.quantity * row.current_price
    const gain = current - invested
    const investedInr = toInr(invested, row.currency, ratesMap)
    const currentInr = toInr(current, row.currency, ratesMap)
    return {
      ...row,
      displayName: row.company,
      invested,
      current,
      gain,
      gainPct: gainPctOf(invested, gain),
      investedInr,
      currentInr,
      gainInr: currentInr - investedInr,
    }
  })
  return { rows: computed, totals: sumTotals(computed), error: null }
}

export function computeSavings(rows: SavingsRow[], ratesMap: RatesMap): CategoryResult<ComputedSavings> {
  const computed = rows.map((row) => {
    const balanceInr = toInr(row.balance, row.currency, ratesMap)
    return {
      ...row,
      displayName: `${row.bank_name} (${row.account_type})`,
      invested: row.balance,
      current: row.balance,
      gain: 0,
      gainPct: 0,
      investedInr: balanceInr,
      currentInr: balanceInr,
      gainInr: 0,
    }
  })
  return { rows: computed, totals: sumTotals(computed), error: null }
}

export function accrualFraction(start: Date, maturity: Date, asOf: Date): number {
  const total = maturity.getTime() - start.getTime()
  if (total <= 0) return 1
  const elapsed = asOf.getTime() - start.getTime()
  return Math.min(1, Math.max(0, elapsed / total))
}

export function computeFixedDeposits(
  rows: FixedDepositRow[],
  ratesMap: RatesMap,
  asOf: Date = new Date(),
): CategoryResult<ComputedFixedDeposit> {
  const computed = rows.map((row) => {
    const start = new Date(row.start_date)
    const maturity = new Date(row.maturity_date)
    const fraction = accrualFraction(start, maturity, asOf)
    const current = row.principal + (row.maturity_value - row.principal) * fraction
    const invested = row.principal
    const gain = current - invested
    const investedInr = toInr(invested, row.currency, ratesMap)
    const currentInr = toInr(current, row.currency, ratesMap)
    return {
      ...row,
      displayName: `${row.bank_name} FD`,
      accrualPct: fraction * 100,
      invested,
      current,
      gain,
      gainPct: gainPctOf(invested, gain),
      investedInr,
      currentInr,
      gainInr: currentInr - investedInr,
    }
  })
  return { rows: computed, totals: sumTotals(computed), error: null }
}

// Balance per company, derived the same way as the PF page's own Account
// Summary/Total Balance: contribution rows count employee+employer (pension
// goes to the separate EPS pension pot, not the withdrawable PF corpus),
// interest rows count in full. Keep this formula in sync with
// PfPage.tsx's buildAccountSummary - both must agree on what "balance" means.
function balanceByCompany(statementRows: PfStatementRow[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const row of statementRows) {
    const amount = row.type === 'Contribution' ? row.employee + row.employer : row.total
    map.set(row.company, (map.get(row.company) ?? 0) + amount)
  }
  return map
}

export function computePf(rows: PfAccountSummaryRawRow[], statementRows: PfStatementRow[] = []): CategoryResult<ComputedPf> {
  const balances = balanceByCompany(statementRows)
  const computed = rows
    .filter((row) => row.company && row.member_id)
    .map((row) => {
      const balance = balances.get(row.company) ?? row.current_balance
      return {
        ...row,
        displayName: `${row.company} · ${row.member_id}`,
        invested: balance,
        current: balance,
        gain: 0,
        gainPct: 0,
        investedInr: balance,
        currentInr: balance,
        gainInr: 0,
      }
    })
  return { rows: computed, totals: sumTotals(computed), error: null }
}

export function buildOverview(results: PortfolioResults): Overview {
  const resultsByKey = results as unknown as Record<string, CategoryResult<unknown>>
  const totalCurrentInr = CATEGORY_META.reduce((sum, meta) => sum + (resultsByKey[meta.key]?.totals.currentInr ?? 0), 0)

  const categories: OverviewCategory[] = CATEGORY_META.map((meta) => {
    const totals = resultsByKey[meta.key]?.totals
    const currentInr = totals?.currentInr ?? 0
    return {
      key: meta.key,
      label: meta.label,
      color: meta.color,
      investedInr: totals?.investedInr ?? 0,
      currentInr,
      gainInr: totals?.gainInr ?? 0,
      gainPct: totals?.gainPct ?? 0,
      pct: totalCurrentInr === 0 ? 0 : (currentInr / totalCurrentInr) * 100,
    }
  }).sort((a, b) => b.currentInr - a.currentInr)

  const totalInvestedInr = categories.reduce((sum, c) => sum + c.investedInr, 0)
  const totalGainInr = totalCurrentInr - totalInvestedInr

  return {
    totalInvestedInr,
    totalCurrentInr,
    totalGainInr,
    totalGainPct: gainPctOf(totalInvestedInr, totalGainInr),
    categories,
  }
}

export function getTopHoldings(results: PortfolioResults, n = 6): TopHolding[] {
  const resultsByKey = results as unknown as Record<
    string,
    CategoryResult<{ displayName: string; currentInr: number; gainPct: number }>
  >
  const holdings: TopHolding[] = []
  for (const meta of CATEGORY_META) {
    const result = resultsByKey[meta.key]
    if (!result) continue
    for (const row of result.rows) {
      holdings.push({
        key: `${meta.key}-${row.displayName}`,
        name: row.displayName,
        categoryLabel: meta.label,
        currentInr: row.currentInr,
        gainPct: row.gainPct,
      })
    }
  }
  return holdings.sort((a, b) => b.currentInr - a.currentInr).slice(0, n)
}

export function getCurrencyExposure(results: PortfolioResults): CurrencyExposureEntry[] {
  const totals = new Map<string, number>()
  const add = (code: string, amountInr: number) => totals.set(code, (totals.get(code) ?? 0) + amountInr)

  for (const r of results.usStocks.rows) add('USD', r.currentInr)
  for (const r of results.indiaStocks.rows) add('INR', r.currentInr)
  for (const r of results.mutualFunds.rows) add('INR', r.currentInr)
  for (const r of results.esops.rows) add(r.currency, r.currentInr)
  for (const r of results.savings.rows) add(r.currency, r.currentInr)
  for (const r of results.fixedDeposits.rows) add(r.currency, r.currentInr)
  for (const r of results.pf.rows) add('INR', r.currentInr)

  return Array.from(totals.entries())
    .map(([code, amountInr]) => ({ code, amountInr }))
    .sort((a, b) => b.amountInr - a.amountInr)
}
