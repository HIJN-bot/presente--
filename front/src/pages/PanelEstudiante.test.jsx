import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PanelEstudiante from './PanelEstudiante'
import { iniciarSesionSimulada, llamadasA, renderizarEn, simularApi, simularPantalla } from '../test/utils'

const EMAIL = 'eva@presente.dev'
const HISTORIAL = [{ id: 7, materia: 'Cálculo', horario: '2026-10-01T08:00:00', docente: 'Ana Ruiz' }]
const NOTAS = [{ id: 1, contenido: 'Repasar tema 3', fecha: '2026-09-30T10:00:00-05:00' }]

function renderizar() {
    return renderizarEn('/estudiante', '/estudiante', <PanelEstudiante />)
}

beforeEach(() => {
    simularPantalla('escritorio')
    iniciarSesionSimulada({ rol: 'student', email: EMAIL, nombre: 'Eva', token: 'jwt.estudiante' })
})

describe('PanelEstudiante', () => {
    it('muestra el historial de asistencia pidiéndolo con el token del estudiante', async () => {
        const api = simularApi([
            { ruta: '/api/asistencia/historial', cuerpo: HISTORIAL },
            { ruta: '/api/notas/consultar', cuerpo: NOTAS },
        ])
        renderizar()

        const tarjeta = (await screen.findByRole('heading', { name: 'Cálculo' })).closest('article')
        expect(within(tarjeta).getByText('ID de clase: 7')).toBeInTheDocument()
        const [[url, opciones]] = llamadasA(api, '/api/asistencia/historial')
        expect(url).toContain(`email_estudiante=${encodeURIComponent(EMAIL)}`)
        expect(opciones.headers.Authorization).toBe('Bearer jwt.estudiante')
    })

    it('sin clases muestra cómo registrar asistencia', async () => {
        simularApi([
            { ruta: '/api/asistencia/historial', cuerpo: [] },
            { ruta: '/api/notas/consultar', cuerpo: [] },
        ])
        renderizar()
        expect(await screen.findByText(/Todavía no has registrado asistencia/)).toBeInTheDocument()
    })

    it('muestra el error del servidor', async () => {
        simularApi([
            { ruta: '/api/asistencia/historial', estado: 403, cuerpo: { detail: 'No tienes permiso para acceder a estos datos' } },
            { ruta: '/api/notas/consultar', cuerpo: [] },
        ])
        renderizar()
        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso para acceder a estos datos')
    })

    it('publica una nota y la muestra primero', async () => {
        const api = simularApi([
            { ruta: '/api/asistencia/historial', cuerpo: [] },
            { ruta: '/api/notas/consultar', cuerpo: NOTAS },
            {
                metodo: 'POST', ruta: '/api/notas/creacion', estado: 201,
                cuerpo: (opciones) => ({ id: 2, contenido: JSON.parse(opciones.body).contenido, fecha: '2026-09-30T11:00:00-05:00' }),
            },
        ])
        renderizar()
        await userEvent.click(await screen.findByRole('button', { name: 'Notas' }))
        expect(await screen.findByText('Repasar tema 3')).toBeInTheDocument()

        const publicar = screen.getByRole('button', { name: 'Publicar' })
        const campo = screen.getByLabelText('Deja una nota aquí')
        await userEvent.type(campo, '   ')
        expect(publicar).toBeDisabled()

        await userEvent.clear(campo)
        await userEvent.type(campo, '  Traer calculadora  ')
        await userEvent.click(publicar)

        const notas = await screen.findAllByRole('listitem')
        expect(notas.map((n) => n.firstChild.textContent)).toEqual(['Traer calculadora', 'Repasar tema 3'])
        expect(campo).toHaveValue('')
        const [[, opciones]] = llamadasA(api, '/api/notas/creacion', 'POST')
        expect(JSON.parse(opciones.body)).toEqual({ contenido: 'Traer calculadora' })
        expect(opciones.headers.Authorization).toBe('Bearer jwt.estudiante')
    })

    it('si el servidor rechaza la nota muestra el motivo y conserva el texto', async () => {
        simularApi([
            { ruta: '/api/asistencia/historial', cuerpo: [] },
            { ruta: '/api/notas/consultar', cuerpo: [] },
            {
                metodo: 'POST', ruta: '/api/notas/creacion', estado: 422,
                cuerpo: { detail: [{ loc: ['body', 'contenido'], type: 'string_too_long' }] },
            },
        ])
        renderizar()
        await userEvent.click(await screen.findByRole('button', { name: 'Notas' }))

        await userEvent.type(screen.getByLabelText('Deja una nota aquí'), 'texto')
        await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('La nota no puede superar los 500 caracteres')
        expect(screen.getByLabelText('Deja una nota aquí')).toHaveValue('texto')
    })
})
