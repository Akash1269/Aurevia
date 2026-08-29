import type { ReactNode } from 'react'
import styles from './HoldingsTable.module.css'

export interface HoldingsColumn<T> {
  key: string
  label: string
  align?: 'left' | 'right'
  render: (row: T) => ReactNode
}

export function HoldingsTable<T extends { displayName: string }>({
  columns,
  rows,
  footer,
}: {
  columns: HoldingsColumn<T>[]
  rows: T[]
  footer?: Partial<Record<string, ReactNode>>
}) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.align === 'right' ? styles.right : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.displayName}-${index}`}>
              {columns.map((col) => (
                <td key={col.key} className={col.align === 'right' ? styles.right : undefined}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot>
            <tr className={styles.footerRow}>
              {columns.map((col) => (
                <td key={col.key} className={col.align === 'right' ? styles.right : undefined}>
                  {footer[col.key] ?? ''}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
