import styles from './AllocationBar.module.css'

export interface AllocationSegment {
  label: string
  pct: number
  amountInr: number
  color: string
}

export function AllocationBar({ segments }: { segments: AllocationSegment[] }) {
  return (
    <div className={styles.bar}>
      {segments
        .filter((s) => s.pct > 0)
        .map((s) => (
          <div key={s.label} style={{ flexBasis: `${s.pct}%`, background: s.color }} className={styles.segment} />
        ))}
    </div>
  )
}
