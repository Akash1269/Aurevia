export function filterBySearch<T extends { displayName: string }>(rows: T[], query: string): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => row.displayName.toLowerCase().includes(q))
}
