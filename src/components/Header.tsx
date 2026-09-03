import { Bell, Moon, RefreshCw, Search, Sun, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { useSearch } from '../context/SearchContext'
import { useTheme } from '../hooks/useTheme'
import { NAV_ITEMS } from '../routes'
import styles from './Header.module.css'

export function Header() {
  const { pathname } = useLocation()
  const { refresh, loading } = usePortfolioData()
  const { theme, toggleTheme } = useTheme()
  const { query, setQuery } = useSearch()
  const title =
    pathname === '/settings' ? 'Settings' : (NAV_ITEMS.find((item) => item.to === pathname)?.label ?? 'Aurevia')

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <div className={styles.search}>
          <Search size={14} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search this page"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search this page"
          />
          {query && (
            <button type="button" className={styles.searchClear} onClick={() => setQuery('')} aria-label="Clear search">
              <X size={13} />
            </button>
          )}
        </div>
        <button
          type="button"
          className={styles.iconButton}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={refresh}
          title="Reload data from CSV files"
          aria-label="Refresh data"
        >
          <RefreshCw size={15} className={loading ? styles.spinning : undefined} />
        </button>
        <button type="button" className={styles.iconButton} title="Notifications" aria-label="Notifications" disabled>
          <Bell size={15} />
        </button>
        <div className={styles.avatar} aria-hidden="true">
          AU
        </div>
      </div>
    </header>
  )
}
