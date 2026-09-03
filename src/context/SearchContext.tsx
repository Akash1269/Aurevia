import { createContext, useContext, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface SearchContextValue {
  query: string
  setQuery: (query: string) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [query, setQuery] = useState('')
  const [queryPathname, setQueryPathname] = useState(pathname)

  // Search is scoped to whatever page you're on, so it shouldn't follow you
  // when you navigate away. Reset during render (rather than in an effect)
  // so the stale query never flashes on the new page.
  if (pathname !== queryPathname) {
    setQueryPathname(pathname)
    setQuery('')
  }

  return <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return ctx
}
