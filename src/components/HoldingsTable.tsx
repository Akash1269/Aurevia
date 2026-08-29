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
}: {
  columns: HoldingsColumn<T>[]
  rows: T[]
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
          {rows.map((row) => (
            <tr key={row.displayName}>
              {columns.map((col) => (
                <td key={col.key} className={col.align === 'right' ? styles.right : undefined}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
