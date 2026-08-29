import { useLocation } from 'react-router-dom'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { NAV_ITEMS } from '../routes'
import { BellIcon, RefreshIcon, SearchIcon } from './icons'
import styles from './Header.module.css'

export function Header() {
  const { pathname } = useLocation()
  const { refresh, loading } = usePortfolioData()
  const title = NAV_ITEMS.find((item) => item.to === pathname)?.label ?? 'iPot'

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <div className={styles.search}>
          <SearchIcon width={16} height={16} />
          <span>Search</span>
        </div>
        <button
          type="button"
          className={styles.iconButton}
          onClick={refresh}
          title="Reload data from CSV files"
          aria-label="Refresh data"
        >
          <RefreshIcon width={17} height={17} className={loading ? styles.spinning : undefined} />
        </button>
        <button type="button" className={styles.iconButton} title="Notifications" aria-label="Notifications" disabled>
          <BellIcon width={17} height={17} />
        </button>
        <div className={styles.avatar} aria-hidden="true">
          IP
        </div>
      </div>
    </header>
  )
}
