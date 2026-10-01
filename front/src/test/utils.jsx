// Utilidades compartidas por las pruebas
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { vi } from 'vitest'

// Simula el ancho de pantalla para useMediaQuery: 'escritorio' (>= 64rem) o 'movil'
export function simularPantalla(tipo) {
    window.matchMedia = (consulta) => ({
        matches: tipo === 'escritorio' && consulta.includes('min-width'),
        media: consulta,
        addEventListener: () => {},
        removeEventListener: () => {},
    })
}

// Reemplaza fetch por una API simulada.
// rutas: [{ metodo, ruta, estado, cuerpo }]; "ruta" se compara con el pathname.
// Devuelve el mock para revisar las llamadas (url, opciones).
export function simularApi(rutas) {
    const mock = vi.fn(async (url, opciones = {}) => {
        const { pathname } = new URL(url)
        const metodo = (opciones.method || 'GET').toUpperCase()
        const coincidencia = rutas.find((r) => r.ruta === pathname && (r.metodo || 'GET') === metodo)
        if (!coincidencia) {
            return new Response(JSON.stringify({ detail: `Sin simular: ${metodo} ${pathname}` }), { status: 500 })
        }
        const cuerpo = typeof coincidencia.cuerpo === 'function' ? coincidencia.cuerpo(opciones) : coincidencia.cuerpo
        return new Response(JSON.stringify(cuerpo ?? {}), {
            status: coincidencia.estado || 200,
            headers: { 'Content-Type': 'application/json' },
        })
    })
    vi.stubGlobal('fetch', mock)
    return mock
}

// Llamadas hechas a una ruta de la API simulada
export function llamadasA(mock, ruta, metodo = 'GET') {
    return mock.mock.calls.filter(([url, opciones = {}]) =>
        new URL(url).pathname === ruta && (opciones.method || 'GET').toUpperCase() === metodo
    )
}

// Muestra la ruta actual para comprobar las redirecciones
function RutaActual() {
    const { pathname, search } = useLocation()
    return <output data-testid='ruta'>{pathname + search}</output>
}

// Renderiza una página dentro de un router en memoria
export function renderizarEn(ruta, patron, pagina) {
    return render(
        <MemoryRouter initialEntries={[ruta]}>
            <Routes>
                <Route path={patron} element={pagina} />
                <Route path='*' element={null} />
            </Routes>
            <RutaActual />
        </MemoryRouter>
    )
}

export function iniciarSesionSimulada({ rol = 'student', email = 'e@presente.dev', nombre = 'Eva', token = 'token.de.prueba' } = {}) {
    localStorage.setItem('token', token)
    localStorage.setItem('role', rol)
    localStorage.setItem('user', JSON.stringify({ nombre, apellido: 'Prueba', email }))
}
