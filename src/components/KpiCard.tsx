import type { ComponentType, SVGProps } from 'react'
import primitives from '../styles/primitives.module.css'
import styles from './KpiCard.module.css'

interface KpiCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  value: string
  badge?: string
  badgeTone?: number
  sublabel?: string
}

export function KpiCard({ icon: Icon, label, value, badge, badgeTone, sublabel }: KpiCardProps) {
  const badgeToneClass =
    badgeTone === undefined || badgeTone === 0 ? '' : badgeTone > 0 ? styles.badgePositive : styles.badgeNegative

  return (
    <div className={`${primitives.card} ${styles.card}`}>
      <div className={styles.iconBadge}>
        <Icon width={16} height={16} />
      </div>
      <span className={styles.label}>{label}</span>
      <div className={styles.valueRow}>
        <span className={primitives.bigNumber}>{value}</span>
        {badge && <span className={`${primitives.badge} ${badgeToneClass}`}>{badge}</span>}
      </div>
      <div className={`${primitives.mutedText} ${styles.sublabel}`}>{sublabel ?? ' '}</div>
    </div>
  )
}
