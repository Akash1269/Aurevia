export type CurrencyCode = string

export interface DataManifest {
  currencyRates: string
  usStocks: string
  indiaStocks: string
  mutualFunds: string
  esops: string
  savings: string
  fixedDeposits: string
  pf: string
  pfContributions: string
}

export interface UsStockRow {
  symbol: string
  name: string
  quantity: number
  avg_buy_price_usd: number
  current_price_usd: number
}

export interface IndiaStockRow {
  symbol: string
  name: string
  sector: string
  quantity: number
  avg_buy_price_inr: number
  current_price_inr: number
}

export interface MutualFundRow {
  fund_name: string
  category: string
  units: number
  avg_nav: number
  current_nav: number
}

export interface EsopRow {
  company: string
  quantity: number
  avg_purchase_price: number
  current_price: number
  currency: CurrencyCode
}

export interface SavingsRow {
  bank_name: string
  account_type: string
  balance: number
  interest_rate_pct: number
  currency: CurrencyCode
}

export interface FixedDepositRow {
  bank_name: string
  principal: number
  interest_rate_pct: number
  start_date: string
  maturity_date: string
  maturity_value: number
  currency: CurrencyCode
}

export interface PfContributionRawRow {
  company: string
  month: string
  employee: number
  employer: number
  pension: number
  total: number
}

export interface PfContributionRow extends PfContributionRawRow {
  displayName: string
}

export interface PfAccountSummaryRawRow {
  member_id: string
  company: string
  from_year: number
  to_year: number
  current_balance: number
  adjustments: number
  employee: number
  employer: number
  interest_earned: number
  transfer_in: number
  withdrawal: number
}

export interface CurrencyRateRow {
  currency_code: string
  rate_to_inr: number
}

export interface WithComputed {
  displayName: string
  invested: number
  current: number
  gain: number
  gainPct: number
  investedInr: number
  currentInr: number
  gainInr: number
}

export type ComputedUsStock = UsStockRow & WithComputed
export type ComputedIndiaStock = IndiaStockRow & WithComputed
export type ComputedMutualFund = MutualFundRow & WithComputed
export type ComputedEsop = EsopRow & WithComputed
export type ComputedSavings = SavingsRow & WithComputed
export type ComputedFixedDeposit = FixedDepositRow & WithComputed & { accrualPct: number }
export type ComputedPf = PfAccountSummaryRawRow & WithComputed

export interface CategoryTotals {
  invested: number
  current: number
  gain: number
  gainPct: number
  investedInr: number
  currentInr: number
  gainInr: number
}

export interface CategoryResult<T> {
  rows: T[]
  totals: CategoryTotals
  error: string | null
}

export type RatesMap = Record<string, number>

export interface OverviewCategory {
  key: string
  label: string
  color: string
  investedInr: number
  currentInr: number
  gainInr: number
  gainPct: number
  pct: number
}

export interface Overview {
  totalInvestedInr: number
  totalCurrentInr: number
  totalGainInr: number
  totalGainPct: number
  categories: OverviewCategory[]
}

export interface TopHolding {
  key: string
  name: string
  categoryLabel: string
  currentInr: number
  gainPct: number
}

export interface CurrencyExposureEntry {
  code: string
  amountInr: number
}

export interface PortfolioResults {
  usStocks: CategoryResult<ComputedUsStock>
  indiaStocks: CategoryResult<ComputedIndiaStock>
  mutualFunds: CategoryResult<ComputedMutualFund>
  esops: CategoryResult<ComputedEsop>
  savings: CategoryResult<ComputedSavings>
  fixedDeposits: CategoryResult<ComputedFixedDeposit>
  pf: CategoryResult<ComputedPf>
}
