import { Bell, Moon, RefreshCw, Search, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { useTheme } from '../hooks/useTheme'
import { NAV_ITEMS } from '../routes'
import styles from './Header.module.css'

export function Header() {
  const { pathname } = useLocation()
  const { refresh, loading } = usePortfolioData()
  const { theme, toggleTheme } = useTheme()
  const title = NAV_ITEMS.find((item) => item.to === pathname)?.label ?? 'iPot'

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <div className={styles.search}>
          <Search size={14} />
          <span>Search</span>
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
          IP
        </div>
      </div>
    </header>
  )
}
