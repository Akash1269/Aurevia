import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function buildDemoPublicDir(): string {
  const dir = join(tmpdir(), 'aurevia-demo-public')
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(join(dir, 'data'), { recursive: true })
  cpSync('public/favicon.svg', join(dir, 'favicon.svg'))
  cpSync('public/data/manifest.json', join(dir, 'data/manifest.json'))
  cpSync('sample-data', join(dir, 'data'), { recursive: true })
  return dir
}

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Aurevia/' : '/',
  plugins: [react()],
  css: {
    modules: {
      generateScopedName: mode === 'production' ? undefined : '[name]__[local]',
    },
  },
  ...(mode === 'demo' ? { publicDir: buildDemoPublicDir() } : {}),
}))
