import Papa from 'papaparse'

export async function loadCsv<T>(path: string): Promise<T[]> {
  const res = await fetch(path, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`)
  }
  const text = await res.text()
  const { data, errors } = Papa.parse<T>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  })
  if (errors.length) {
    console.warn(`CSV parse warnings for ${path}`, errors)
  }
  return data
}
