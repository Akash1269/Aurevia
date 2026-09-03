import { createContext, useContext } from 'react'

export interface SettingsContextValue {
  displayCurrency: string
  setDisplayCurrency: (code: string) => void
  hiddenTabs: Set<string>
  setTabHidden: (to: string, hidden: boolean) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}
