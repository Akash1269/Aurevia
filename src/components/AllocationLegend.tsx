import { formatInr } from '../utils/format'
import type { AllocationSegment } from './AllocationBar'
import styles from './AllocationLegend.module.css'

export function AllocationLegend({ entries }: { entries: AllocationSegment[] }) {
  return (
    <ul className={styles.legend}>
      {entries.map((entry) => (
        <li key={entry.label} className={styles.row}>
          <span className={styles.labelGroup}>
            <span className={styles.dot} style={{ background: entry.color }} />
            <span>{entry.label}</span>
            <span className={styles.pct}>{entry.pct.toFixed(0)}%</span>
          </span>
          <span className={styles.amount}>{formatInr(entry.amountInr)}</span>
        </li>
      ))}
    </ul>
  )
}
