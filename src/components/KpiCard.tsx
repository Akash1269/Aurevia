import type { ComponentType, SVGProps } from 'react'
import primitives from '../styles/primitives.module.css'
import styles from './KpiCard.module.css'

interface KpiCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  value: string
  badge?: string
  sublabel?: string
}

export function KpiCard({ icon: Icon, label, value, badge, sublabel }: KpiCardProps) {
  return (
    <div className={`${primitives.card} ${styles.card}`}>
      <div className={styles.label}>
        <Icon width={16} height={16} />
        <span>{label}</span>
      </div>
      <div className={styles.valueRow}>
        <span className={primitives.bigNumber}>{value}</span>
        {badge && <span className={primitives.badge}>{badge}</span>}
      </div>
      <div className={`${primitives.mutedText} ${styles.sublabel}`}>{sublabel ?? ' '}</div>
    </div>
  )
}
