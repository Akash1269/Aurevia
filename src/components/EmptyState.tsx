import primitives from '../styles/primitives.module.css'

export function EmptyState({ message = 'No rows yet — add data to the CSV file.' }: { message?: string }) {
  return <div className={primitives.mutedText}>{message}</div>
}
