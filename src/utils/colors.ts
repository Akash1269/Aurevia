export const ALLOC_COLORS = [
  'var(--alloc-1)',
  'var(--alloc-2)',
  'var(--alloc-3)',
  'var(--alloc-4)',
  'var(--alloc-5)',
  'var(--alloc-6)',
  'var(--alloc-7)',
]

export function colorForIndex(i: number): string {
  return ALLOC_COLORS[i % ALLOC_COLORS.length]
}
