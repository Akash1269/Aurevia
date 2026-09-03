# Aurevia

A personal investment dashboard. Aurevia reads your holdings from plain CSV
files and renders a single-page overview of your net worth across US
stocks, India stocks, mutual funds, ESOPs, savings accounts, fixed
deposits, and India Provident Fund (PF) — with everything converted to a
common currency (INR) so you can see one true total.

There's no backend, no database, and no account system: your data lives
in CSV files under `public/data/`, and the app is just a static site that
reads them.

## Features

- **Overview** — total net worth, category breakdown, top holdings, and
  currency exposure, all rolled up from every category below.
- **Per-category pages** — US Stocks, India Stocks, Mutual Funds, ESOPs,
  Savings Accounts, Fixed Deposits, and India PF, each with KPI tiles,
  sortable holdings tables, and allocation charts.
- **India PF** — a dedicated ledger view: account summary by employer,
  contribution/interest timelines, and a filterable, searchable
  transaction history.
- **Projections** — forward-looking growth projections based on your
  current portfolio.
- **Currency Converter** — a quick INR/USD (and other currency) converter
  using the same exchange rates the dashboard uses internally.
- **Light/dark theme**, responsive layout.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and produce a production build
- `npm run preview` — preview the production build
- `npm run lint` — run oxlint

## Using it with your own data

Everything the dashboard displays is sourced from CSV files in
[`public/data/`](public/data). Edit these in place (or replace them) and
reload the page — there's no build step required for data changes in dev.

| File                     | Category         | Key columns                                                                                    |
| ------------------------ | ---------------- | ---------------------------------------------------------------------------------------------- |
| `us-stocks.csv`          | US Stocks        | `symbol, name, quantity, avg_buy_price_usd, current_price_usd`                                 |
| `india-stocks.csv`       | India Stocks     | `symbol, name, sector, quantity, avg_buy_price_inr, current_price_inr`                         |
| `mutual-funds-india.csv` | Mutual Funds     | `fund_name, category, units, avg_nav, current_nav`                                             |
| `esops.csv`              | ESOPs            | `company, quantity, avg_purchase_price, current_price, currency`                               |
| `savings-accounts.csv`   | Savings Accounts | `bank_name, account_type, balance, interest_rate_pct, currency`                                |
| `fixed-deposits.csv`     | Fixed Deposits   | `bank_name, principal, interest_rate_pct, start_date, maturity_date, maturity_value, currency` |
| `pf.csv`                 | India PF         | `company, month, transaction_date, type, employee, employer, pension, notes`                   |
| `currency-rates.csv`     | Exchange rates   | `currency_code, rate_to_inr` — used to convert every non-INR holding to INR                    |

Notes:

- `pf.csv` is the sole source for India PF — every contribution
  and interest row lives there directly (`type` is either `Contribution` or
  `Interest`), and the per-company Account Summary shown on the PF page and
  used everywhere else in the app (Overview, Top Holdings, Currency
  Exposure) is aggregated from it at read time.
- Add a currency to `currency-rates.csv` before using that currency code
  elsewhere (e.g. in `esops.csv` or `savings-accounts.csv`), or amounts in
  that currency won't convert to INR correctly.
- File paths are resolved through [`public/data/manifest.json`](public/data/manifest.json).
  If you rename or move a CSV, update its entry there.

## Tech stack

React 19 + TypeScript, built with Vite, charts via Recharts, CSV parsing
via PapaParse, routing via React Router, icons via Lucide. Styling is
plain CSS Modules — no CSS framework.
