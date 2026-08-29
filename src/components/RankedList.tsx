import type { ReactNode } from 'react'
import styles from './RankedList.module.css'

export interface RankedItem {
  key: string
  label: string
  value: ReactNode
}

export function RankedList({ items }: { items: RankedItem[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.key} className={styles.row}>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.value}>{item.value}</span>
        </li>
      ))}
    </ul>
  )
}
