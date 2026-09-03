import { Settings, Sparkle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { NAV_ITEMS } from '../routes'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { hiddenTabs } = useSettings()
  const visibleItems = NAV_ITEMS.filter((item) => !hiddenTabs.has(item.to))

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Sparkle size={18} />
        <span className={styles.logoText}>Aurevia</span>
      </div>
      <nav className={styles.nav}>
        {visibleItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            title={label}
            aria-label={label}
          >
            <Icon size={16} />
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink
        to="/settings"
        className={({ isActive }) => `${styles.gear} ${isActive ? styles.navItemActive : ''}`}
        title="Settings"
        aria-label="Settings"
      >
        <Settings size={16} />
        <span className={styles.navLabel}>Settings</span>
      </NavLink>
    </aside>
  )
}
