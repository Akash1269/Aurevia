import Papa from 'papaparse'
import { isSampleDataEnabled } from '../context/SettingsContext'
import { readFileFromFolder } from './localFolder'

async function fetchText(path: string): Promise<string> {
  const res = await fetch(path, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`)
  }
  return res.text()
}

function sampleDataUrl(basename: string): string {
  return `${import.meta.env.BASE_URL}sample-data/${basename}`
}

export async function loadCsv<T>(path: string): Promise<T[]> {
  const basename = path.split('/').pop() ?? path

  // Sample data (Settings > Data Source) overrides everything else,
  // including a chosen local folder - it's meant as a full, unambiguous
  // demo mode, not one more source to merge in.
  let text: string
  if (isSampleDataEnabled()) {
    text = await fetchText(sampleDataUrl(basename))
  } else {
    const localText = await readFileFromFolder(basename)
    text = localText ?? (await fetchText(path))
  }

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
