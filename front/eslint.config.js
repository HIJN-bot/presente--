import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Las pruebas no pasan por Fast Refresh: pueden mezclar componentes y utilidades
    files: ['src/test/**/*.{js,jsx}', 'src/**/*.test.{js,jsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Archivos que se ejecutan en Node (configuración de Vite y pruebas end-to-end)
    files: ['vite.config.js', 'src/e2e/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
])
