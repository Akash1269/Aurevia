// Lets a person point iPot at a real folder on their computer via the File
// System Access API, so CSVs are read live from disk on every load/refresh -
// never a stored copy. Chromium browsers only (Chrome, Edge); Firefox and
// Safari don't implement this API and silently fall back to the bundled,
// fetched data (see loadCsv.ts).
const DB_NAME = 'ipot-local-folder'
const STORE_NAME = 'handles'
const HANDLE_KEY = 'data-folder'
const DB_VERSION = 1

export function isFolderPickerSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getStoredHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDb()
    try {
      const handle = await new Promise<FileSystemDirectoryHandle | undefined>((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(HANDLE_KEY)
        request.onsuccess = () => resolve(request.result as FileSystemDirectoryHandle | undefined)
        request.onerror = () => reject(request.error)
      })
      return handle ?? null
    } finally {
      db.close()
    }
  } catch {
    return null
  }
}

async function setStoredHandle(handle: FileSystemDirectoryHandle | null): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    if (handle) tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY)
    else tx.objectStore(STORE_NAME).delete(HANDLE_KEY)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

// Resolved once per page session and reused for every CSV load, rather than
// re-opening IndexedDB and re-checking permission for each of the ~8 files
// on every load/refresh. Cleared whenever the folder selection changes.
let cachedHandle: FileSystemDirectoryHandle | null | undefined

function invalidateCache(): void {
  cachedHandle = undefined
}

export interface FolderStatus {
  name: string
  permission: PermissionState
}

export async function getFolderStatus(): Promise<FolderStatus | null> {
  const handle = await getStoredHandle()
  if (!handle) return null
  const permission = await handle.queryPermission({ mode: 'read' })
  return { name: handle.name, permission }
}

export async function chooseFolder(): Promise<boolean> {
  if (!isFolderPickerSupported()) return false
  try {
    const handle = await window.showDirectoryPicker({ mode: 'read' })
    await setStoredHandle(handle)
    invalidateCache()
    return true
  } catch {
    // Person cancelled the picker, or the browser refused it.
    return false
  }
}

export async function reconnectFolder(): Promise<boolean> {
  const handle = await getStoredHandle()
  if (!handle) return false
  const permission = await handle.requestPermission({ mode: 'read' })
  invalidateCache()
  return permission === 'granted'
}

export async function clearFolder(): Promise<void> {
  await setStoredHandle(null)
  invalidateCache()
}

async function getActiveHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (cachedHandle !== undefined) return cachedHandle
  const handle = await getStoredHandle()
  if (!handle) {
    cachedHandle = null
    return null
  }
  const permission = await handle.queryPermission({ mode: 'read' })
  cachedHandle = permission === 'granted' ? handle : null
  return cachedHandle
}

export async function readFileFromFolder(basename: string): Promise<string | null> {
  const handle = await getActiveHandle()
  if (!handle) return null
  try {
    const fileHandle = await handle.getFileHandle(basename)
    const file = await fileHandle.getFile()
    return await file.text()
  } catch {
    return null
  }
}

// Existence-only check (no content read) for the Settings page's "which
// files did we actually find" status list.
export async function listFilesPresentInFolder(basenames: string[]): Promise<string[]> {
  const handle = await getActiveHandle()
  if (!handle) return []
  const present: string[] = []
  for (const name of basenames) {
    try {
      await handle.getFileHandle(name)
      present.push(name)
    } catch {
      // not in this folder
    }
  }
  return present
}
