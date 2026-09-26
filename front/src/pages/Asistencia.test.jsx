import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import Asistencia from './Asistencia'
import { iniciarSesionSimulada, llamadasA, renderizarEn, simularApi } from '../test/utils'

const EMAIL = 'eva@presente.dev'

function renderizar(idClase = '5') {
    return renderizarEn(`/asistencia?clase_id=${idClase}`, '/asistencia', <Asistencia />)
}

describe('Asistencia (destino del QR)', () => {
    it('sin sesión guarda la clase y manda a iniciar sesión', async () => {
        const api = simularApi([])
        renderizar()

        expect(await screen.findByTestId('ruta')).toHaveTextContent('/login')
        expect(localStorage.getItem('idClase')).toBe('5')
        expect(api).not.toHaveBeenCalled()
    })

    it('con sesión registra la asistencia y vuelve al panel', async () => {
        iniciarSesionSimulada({ email: EMAIL, token: 'jwt.estudiante' })
        const api = simularApi([{ metodo: 'POST', ruta: '/api/asistencia/registro', estado: 201, cuerpo: {} }])
        renderizar()

        expect(await screen.findByRole('heading', { name: 'Asistencia registrada' })).toBeInTheDocument()
        const [[, opciones]] = llamadasA(api, '/api/asistencia/registro', 'POST')
        expect(JSON.parse(opciones.body)).toEqual({ id_clase: '5', email_estudiante: EMAIL })
        expect(opciones.headers.Authorization).toBe('Bearer jwt.estudiante')
        expect(localStorage.getItem('idClase')).toBeNull()
        await waitFor(() => expect(screen.getByTestId('ruta')).toHaveTextContent('/estudiante'), { timeout: 3000 })
    })

    it('si el servidor rechaza el registro muestra el error y olvida la clase', async () => {
        iniciarSesionSimulada({ email: EMAIL })
        simularApi([{ metodo: 'POST', ruta: '/api/asistencia/registro', estado: 409, cuerpo: { detail: 'Ya registrada' } }])
        renderizar()

        expect(await screen.findByRole('heading', { name: 'Error' })).toBeInTheDocument()
        expect(localStorage.getItem('idClase')).toBeNull()
    })

    it('con la sesión vencida conserva la clase para registrarla tras el login', async () => {
        iniciarSesionSimulada({ email: EMAIL, token: 'vencido' })
        simularApi([{ metodo: 'POST', ruta: '/api/asistencia/registro', estado: 401, cuerpo: { detail: 'Tu sesión expiró' } }])
        vi.spyOn(console, 'error').mockImplementation(() => {})
        renderizar()

        await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
        expect(localStorage.getItem('idClase')).toBe('5')
        expect(screen.getByRole('heading', { name: 'Registrando asistencia' })).toBeInTheDocument()
    })
})
