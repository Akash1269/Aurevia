import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../routes'
import { GearIcon, LogoIcon } from './icons'
import styles from './Sidebar.module.css'

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <LogoIcon width={22} height={22} />
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
            <Icon width={19} height={19} />
          </NavLink>
        ))}
      </nav>
      <button type="button" className={styles.gear} title="Settings (coming soon)" aria-label="Settings" disabled>
        <GearIcon width={19} height={19} />
      </button>
    </aside>
  )
}
