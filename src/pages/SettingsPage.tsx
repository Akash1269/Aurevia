import { Coins, Eye, Palette } from 'lucide-react'
import { Card } from '../components/Card'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { useSettings } from '../context/SettingsContext'
import { useTheme } from '../hooks/useTheme'
import { NAV_ITEMS } from '../routes'
import primitives from '../styles/primitives.module.css'
import styles from './SettingsPage.module.css'

const CURRENCY_LABELS: Record<string, string> = { INR: 'Indian Rupee (₹)', USD: 'US Dollar ($)' }

export function SettingsPage() {
  const { ratesMap } = usePortfolioData()
  const { displayCurrency, setDisplayCurrency, hiddenTabs, setTabHidden } = useSettings()
  const { theme, setTheme } = useTheme()

  const currencyOptions = Object.keys(ratesMap).sort((a, b) =>
    a === 'INR' ? -1 : b === 'INR' ? 1 : a.localeCompare(b),
  )
  const visibleCount = NAV_ITEMS.length - hiddenTabs.size

  return (
    <>
      <Card
        icon={Coins}
        title="Display Currency"
        actions={
          <select
            className={styles.select}
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
          >
            {currencyOptions.map((code) => (
              <option key={code} value={code}>
                {CURRENCY_LABELS[code] ?? code}
              </option>
            ))}
          </select>
        }
      >
        <p className={styles.description}>
          The primary figure on KPI cards across the app is shown in this currency, converted using the live rates from
          Currency Converter.
        </p>
      </Card>

      <Card
        icon={Palette}
        title="Theme"
        actions={
          <div className={primitives.pillTabs}>
            <button
              type="button"
              className={`${primitives.pillTab} ${theme === 'light' ? primitives.pillTabActive : ''}`}
              onClick={() => setTheme('light')}
            >
              Light
            </button>
            <button
              type="button"
              className={`${primitives.pillTab} ${theme === 'dark' ? primitives.pillTabActive : ''}`}
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
          </div>
        }
      >
        <p className={styles.description}>Switch between light and dark mode.</p>
      </Card>

      <Card icon={Eye} title="Visible Tabs">
        <p className={styles.description}>
          Choose which sections appear in the sidebar. At least one must stay visible.
        </p>
        <div className={styles.tabPills}>
          {NAV_ITEMS.map((item) => {
            const isHidden = hiddenTabs.has(item.to)
            const isOnlyVisible = !isHidden && visibleCount === 1
            return (
              <label key={item.to} className={`${styles.tabPill} ${!isHidden ? styles.tabPillActive : ''}`}>
                <item.Icon size={14} />
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  className={styles.tabCheckbox}
                  checked={!isHidden}
                  disabled={isOnlyVisible}
                  onChange={(e) => setTabHidden(item.to, !e.target.checked)}
                />
              </label>
            )
          })}
        </div>
      </Card>
    </>
  )
}
