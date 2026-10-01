// Configuración común de las pruebas (Vitest + jsdom + Testing Library)
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { simularPantalla } from './utils'

// jsdom no implementa <dialog>: simulamos lo mínimo que usa Modal.jsx
if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
        this.open = true
    }
    HTMLDialogElement.prototype.close = function () {
        this.open = false
        this.dispatchEvent(new Event('close'))
    }
}

// jsdom tampoco implementa matchMedia; por defecto simulamos una pantalla de móvil
simularPantalla('movil')

afterEach(() => {
    cleanup()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    simularPantalla('movil')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})
