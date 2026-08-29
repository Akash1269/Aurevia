import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import styles from './HoldingsTable.module.css'

export interface HoldingsColumn<T> {
  key: string
  label: string
  align?: 'left' | 'right'
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
}

interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
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
  const [sort, setSort] = useState<SortState | null>(null)

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((col) => col.key === sort.key)
    if (!column?.sortValue) return rows
    const { sortValue } = column
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = sortValue(a)
      const bv = sortValue(b)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
      return String(av).localeCompare(String(bv)) * factor
    })
  }, [rows, sort, columns])

  function handleSort(column: HoldingsColumn<T>) {
    if (!column.sortValue) return
    setSort((prev) =>
      prev?.key === column.key ? { key: column.key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key: column.key, direction: 'asc' },
    )
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cx(col.align === 'right' && styles.right, col.sortValue && styles.sortable)}
                onClick={() => handleSort(col)}
              >
                <span className={styles.headerLabel}>
                  {col.label}
                  {col.sortValue && (
                    <span className={cx(styles.sortIcon, sort?.key === col.key && styles.sortIconActive)}>
                      {sort?.key === col.key ? (
                        sort.direction === 'asc' ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )
                      ) : (
                        <ChevronsUpDown size={12} />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => (
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
