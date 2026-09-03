import { Coins, Eye, FolderUp, Palette } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { useSettings } from '../context/SettingsContext'
import {
  chooseFolder,
  clearFolder,
  getFolderStatus,
  isFolderPickerSupported,
  listFilesPresentInFolder,
  reconnectFolder,
  type FolderStatus,
} from '../data/localFolder'
import { useTheme } from '../hooks/useTheme'
import { NAV_ITEMS } from '../routes'
import primitives from '../styles/primitives.module.css'
import styles from './SettingsPage.module.css'

const CURRENCY_LABELS: Record<string, string> = { INR: 'Indian Rupee (₹)', USD: 'US Dollar ($)' }

// The filenames the app actually reads (see DEFAULT_MANIFEST in data/manifest.ts).
// Files in the chosen folder are matched against these by name.
const EXPECTED_FILES = [
  'currency-rates.csv',
  'us-stocks.csv',
  'india-stocks.csv',
  'mutual-funds-india.csv',
  'esops.csv',
  'savings-accounts.csv',
  'fixed-deposits.csv',
  'pf.csv',
]

export function SettingsPage() {
  const { ratesMap, refresh } = usePortfolioData()
  const { displayCurrency, setDisplayCurrency, hiddenTabs, setTabHidden, useSampleData, setUseSampleData } =
    useSettings()
  const { theme, setTheme } = useTheme()
  const supported = isFolderPickerSupported()
  const [folderStatus, setFolderStatus] = useState<FolderStatus | null>(null)
  const [presentFiles, setPresentFiles] = useState<string[]>([])

  async function refreshFolderStatus() {
    const status = await getFolderStatus()
    setFolderStatus(status)
    setPresentFiles(status?.permission === 'granted' ? await listFilesPresentInFolder(EXPECTED_FILES) : [])
  }

  useEffect(() => {
    let cancelled = false
    async function init() {
      const status = await getFolderStatus()
      if (cancelled) return
      setFolderStatus(status)
      setPresentFiles(status?.permission === 'granted' ? await listFilesPresentInFolder(EXPECTED_FILES) : [])
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleChooseFolder() {
    if (await chooseFolder()) {
      await refreshFolderStatus()
      refresh()
    }
  }

  async function handleReconnect() {
    if (await reconnectFolder()) {
      await refreshFolderStatus()
      refresh()
    }
  }

  async function handleClearFolder() {
    await clearFolder()
    await refreshFolderStatus()
    refresh()
  }

  function handleSetUseSampleData(value: boolean) {
    setUseSampleData(value)
    refresh()
  }

  const missingFiles = EXPECTED_FILES.filter((name) => !presentFiles.includes(name))

  const currencyOptions = Object.keys(ratesMap).sort((a, b) =>
    a === 'INR' ? -1 : b === 'INR' ? 1 : a.localeCompare(b),
  )
  const visibleCount = NAV_ITEMS.length - hiddenTabs.size

  return (
    <>
      <Card
        icon={FolderUp}
        title="Data Source"
        actions={
          <div className={primitives.pillTabs}>
            <button
              type="button"
              className={`${primitives.pillTab} ${useSampleData ? primitives.pillTabActive : ''}`}
              onClick={() => handleSetUseSampleData(true)}
            >
              Sample Data
            </button>
            <button
              type="button"
              className={`${primitives.pillTab} ${!useSampleData ? primitives.pillTabActive : ''}`}
              onClick={() => handleSetUseSampleData(false)}
            >
              My Data
            </button>
          </div>
        }
      >
        <p className={styles.description}>
          {useSampleData
            ? 'Showing fake demo data so you can explore the app without any setup - none of it is real. Switch to "My Data" to read your own CSVs.'
            : 'Reading your real data.'}
        </p>

        <div className={useSampleData ? styles.folderSectionDisabled : undefined}>
          {!supported ? (
            <p className={styles.description}>
              Reading CSVs from a local folder needs the File System Access API, which Chrome and Edge support but
              Firefox and Safari don't. iPot is reading the bundled data in this browser.
            </p>
          ) : (
            <>
              <div className={styles.dataSourceActions}>
                <button
                  type="button"
                  className={primitives.pillButton}
                  onClick={handleChooseFolder}
                  disabled={useSampleData}
                >
                  {folderStatus ? 'Change Folder' : 'Choose Folder'}
                </button>
                {folderStatus && (
                  <button
                    type="button"
                    className={`${primitives.pillButton} ${primitives.pillButtonLight}`}
                    onClick={handleClearFolder}
                    disabled={useSampleData}
                  >
                    Clear
                  </button>
                )}
              </div>
              {!folderStatus ? (
                <p className={styles.description}>
                  Choose a folder on your computer to read your own CSVs instead of the bundled files - matched by name,
                  read live from disk on every load, never uploaded anywhere.
                </p>
              ) : folderStatus.permission === 'granted' ? (
                <div className={styles.fileStatus}>
                  <div>
                    <span className={styles.fileStatusLabel}>
                      Found in <strong>{folderStatus.name}</strong>
                    </span>
                    <div className={styles.fileChips}>
                      {presentFiles.length === 0 ? (
                        <span className={primitives.mutedText}>None of the expected files were found.</span>
                      ) : (
                        presentFiles.map((name) => (
                          <span key={name} className={styles.fileChipMatched}>
                            {name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  {missingFiles.length > 0 && (
                    <div>
                      <span className={styles.fileStatusLabel}>Still using bundled data</span>
                      <div className={styles.fileChips}>
                        {missingFiles.map((name) => (
                          <span key={name} className={styles.fileChipBundled}>
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className={styles.description}>
                    {folderStatus.permission === 'denied'
                      ? `Access to "${folderStatus.name}" was denied. Choose a folder again to grant access.`
                      : `Reconnect to "${folderStatus.name}" to keep reading from it - your browser needs to reconfirm access after a restart.`}
                  </p>
                  {folderStatus.permission === 'prompt' && (
                    <button
                      type="button"
                      className={primitives.pillButton}
                      onClick={handleReconnect}
                      disabled={useSampleData}
                    >
                      Reconnect
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </Card>

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
