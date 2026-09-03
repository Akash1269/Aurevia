import { NavLink } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { NAV_ITEMS } from '../routes'
import styles from './MobileTabBar.module.css'

export function MobileTabBar() {
  const { hiddenTabs } = useSettings()
  const visibleItems = NAV_ITEMS.filter((item) => !hiddenTabs.has(item.to))

  return (
    <nav className={styles.tabs}>
      {visibleItems.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
        >
          <Icon size={14} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
