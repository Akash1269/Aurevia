import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const CURRENCY_KEY = 'settings.displayCurrency'
const HIDDEN_TABS_KEY = 'settings.hiddenTabs'

interface SettingsContextValue {
  displayCurrency: string
  setDisplayCurrency: (code: string) => void
  hiddenTabs: Set<string>
  setTabHidden: (to: string, hidden: boolean) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function getInitialHiddenTabs(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_TABS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrency] = useState(() => localStorage.getItem(CURRENCY_KEY) ?? 'INR')
  const [hiddenTabs, setHiddenTabs] = useState<Set<string>>(getInitialHiddenTabs)

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, displayCurrency)
  }, [displayCurrency])

  useEffect(() => {
    localStorage.setItem(HIDDEN_TABS_KEY, JSON.stringify(Array.from(hiddenTabs)))
  }, [hiddenTabs])

  function setTabHidden(to: string, hidden: boolean) {
    setHiddenTabs((prev) => {
      const next = new Set(prev)
      if (hidden) next.add(to)
      else next.delete(to)
      return next
    })
  }

  return (
    <SettingsContext.Provider value={{ displayCurrency, setDisplayCurrency, hiddenTabs, setTabHidden }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}
