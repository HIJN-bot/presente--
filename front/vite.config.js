import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pruebas con Vitest: DOM simulado con jsdom (ver src/test/setup.js)
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    // Las pruebas end-to-end (src/e2e) necesitan el backend de pruebas levantado:
    // solo se ejecutan con "npm run test:e2e" (que define E2E_API_URL)
    exclude: process.env.E2E_API_URL
      ? configDefaults.exclude
      : [...configDefaults.exclude, 'src/e2e/**'],
  },
})
