import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './InfoTooltip.module.css'

export function InfoTooltip({ children }: { children: ReactNode }) {
  return (
    <span className={styles.wrapper} tabIndex={0}>
      <Info size={14} />
      <span className={styles.bubble}>{children}</span>
    </span>
  )
}
