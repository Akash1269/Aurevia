import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'


function buildDemoPublicDir(): string {
  const dir = join(tmpdir(), 'ipot-demo-public')
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(join(dir, 'data'), { recursive: true })
  cpSync('public/favicon.svg', join(dir, 'favicon.svg'))
  cpSync('public/data/manifest.json', join(dir, 'data/manifest.json'))
  cpSync('sample-data', join(dir, 'data'), { recursive: true })
  return dir
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/iPot/' : '/',
  plugins: [react()],
  ...(mode === 'demo' ? { publicDir: buildDemoPublicDir() } : {}),
}))
