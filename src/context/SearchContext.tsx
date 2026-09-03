import { createContext, useContext } from 'react'

export interface SearchContextValue {
  query: string
  setQuery: (query: string) => void
}

export const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return ctx
}
