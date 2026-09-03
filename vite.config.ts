import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Aurevia/' : '/',
  plugins: [react()],
  css: {
    modules: {
      generateScopedName: mode === 'production' ? undefined : '[name]__[local]',
    },
  },
}))
