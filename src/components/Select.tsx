import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <select className={styles.select} {...props} />
      <ChevronDown size={14} className={styles.chevron} />
    </div>
  )
}
