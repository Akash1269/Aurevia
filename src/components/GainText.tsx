import type { ReactNode } from 'react'
import styles from './GainText.module.css'

export function GainText({ value, children }: { value: number; children: ReactNode }) {
  const cls = value > 0 ? styles.positive : value < 0 ? styles.negative : undefined
  return <span className={cls}>{children}</span>
}
