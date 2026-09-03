import { Moon, RefreshCw, Search, Settings, Sparkle, Sun, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)
  const title =
    pathname === '/settings' ? 'Settings' : (NAV_ITEMS.find((item) => item.to === pathname)?.label ?? 'Aurevia')

  const mobileSearchActive = mobileSearchOpen || query.length > 0

  function openMobileSearch() {
    setMobileSearchOpen(true)
    requestAnimationFrame(() => mobileSearchInputRef.current?.focus())
  }

  function closeMobileSearch() {
    setQuery('')
    setMobileSearchOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Sparkle size={16} className={styles.brandIcon} />
        <h1 className={`${styles.title} ${mobileSearchActive ? styles.titleHidden : ''}`}>{title}</h1>
        <div className={`${styles.mobileSearch} ${mobileSearchActive ? styles.mobileSearchOpen : ''}`}>
          <Search size={14} />
          <input
            ref={mobileSearchInputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search this page"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => {
              if (!query) setMobileSearchOpen(false)
            }}
            aria-label="Search this page"
          />
          <button type="button" className={styles.searchClear} onClick={closeMobileSearch} aria-label="Close search">
            <X size={13} />
          </button>
        </div>
      </div>
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
        {!mobileSearchActive && (
          <button
            type="button"
            className={`${styles.iconButton} ${styles.mobileSearchButton}`}
            onClick={openMobileSearch}
            aria-label="Search this page"
          >
            <Search size={15} />
          </button>
        )}
        <button
          type="button"
          className={styles.iconButton}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${styles.iconButton} ${styles.settingsLink} ${isActive ? styles.settingsLinkActive : ''}`
          }
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={15} />
        </NavLink>
        <button
          type="button"
          className={styles.iconButton}
          onClick={refresh}
          title="Reload data from CSV files"
          aria-label="Refresh data"
        >
          <RefreshCw size={15} className={loading ? styles.spinning : undefined} />
        </button>
      </div>
    </header>
  )
}
