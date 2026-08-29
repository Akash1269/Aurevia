import { Settings, Sparkle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../routes'
import styles from './Sidebar.module.css'

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Sparkle size={18} />
      </div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label, Icon }) => (
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
      <button type="button" className={styles.gear} title="Settings (coming soon)" aria-label="Settings" disabled>
        <Settings size={16} />
        <span className={styles.navLabel}>Settings</span>
      </button>
    </aside>
  )
}
