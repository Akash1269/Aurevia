import { ShieldCheck } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Header } from '../components/Header'
import { MobileTabBar } from '../components/MobileTabBar'
import { Sidebar } from '../components/Sidebar'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <MobileTabBar />
        <main className={styles.main}>
          <Outlet />
          <footer className={styles.footer}>
            <ShieldCheck size={13} />
            <span>
              Your data stays completely offline - everything is read locally and nothing is ever sent to a server.
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}
