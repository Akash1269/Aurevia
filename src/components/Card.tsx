import type { ComponentType, ReactNode, SVGProps } from 'react'
import primitives from '../styles/primitives.module.css'
import styles from './Card.module.css'

interface CardProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  title?: ReactNode
  actions?: ReactNode
  align?: 'start' | 'center'
  className?: string
  children: ReactNode
}

export function Card({ icon: Icon, title, actions, align = 'start', className, children }: CardProps) {
  return (
    <div className={[primitives.card, styles.card, className].filter(Boolean).join(' ')}>
      {title && (
        <div className={styles.header}>
          <div className={primitives.cardTitle}>
            {Icon && <Icon width={16} height={16} />}
            <span>{title}</span>
          </div>
          {actions}
        </div>
      )}
      <div className={`${styles.body} ${align === 'center' ? styles.bodyCenter : ''}`}>{children}</div>
    </div>
  )
}
