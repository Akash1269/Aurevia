import { createContext, useContext } from 'react'

export const SAMPLE_DATA_KEY = 'settings.useSampleData'

// Read directly (rather than through the hook) so the plain data-loading
// layer - loadCsv.ts, which isn't a React component - can check this too.
// Sample data is the default so a fresh visitor (e.g. the GitHub Pages demo)
// sees a populated dashboard with no setup required.
export function isSampleDataEnabled(): boolean {
  const stored = localStorage.getItem(SAMPLE_DATA_KEY)
  return stored === null ? true : stored === 'true'
}

export interface SettingsContextValue {
  displayCurrency: string
  setDisplayCurrency: (code: string) => void
  hiddenTabs: Set<string>
  setTabHidden: (to: string, hidden: boolean) => void
  useSampleData: boolean
  setUseSampleData: (value: boolean) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}
