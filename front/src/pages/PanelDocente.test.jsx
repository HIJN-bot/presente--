import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PanelDocente from './PanelDocente'
import { iniciarSesionSimulada, llamadasA, renderizarEn, simularApi, simularPantalla } from '../test/utils'

const EMAIL = 'doc@presente.dev'
const QR_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
const CLASES = [
    { id: 1, materia: 'Cálculo', horario: '2026-10-01T08:00:00', qr: QR_PNG, student_count: 1 },
    { id: 2, materia: 'Física', horario: '2026-10-02T10:00:00', qr: QR_PNG, student_count: 3 },
]

function apiDocente(extra = []) {
    return simularApi([{ ruta: '/api/clases/consultar', cuerpo: CLASES }, ...extra])
}

function renderizar() {
    return renderizarEn('/docente', '/docente', <PanelDocente />)
}

beforeEach(() => {
    simularPantalla('escritorio')
    iniciarSesionSimulada({ rol: 'teacher', email: EMAIL, nombre: 'Doc', token: 'jwt.docente' })
    vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('PanelDocente', () => {
    it('carga las clases del docente enviando su token', async () => {
        const api = apiDocente()
        renderizar()

        expect(await screen.findByRole('heading', { name: 'Cálculo' })).toBeInTheDocument()
        expect(screen.getByText('1 estudiante')).toBeInTheDocument()
        expect(screen.getByText('3 estudiantes')).toBeInTheDocument()
        const [[url, opciones]] = llamadasA(api, '/api/clases/consultar')
        expect(url).toContain(`email_docente=${EMAIL}`)
        expect(opciones.headers.Authorization).toBe('Bearer jwt.docente')
    })

    it('Ver QR abre el modal con la imagen del código', async () => {
        apiDocente()
        renderizar()

        const tarjeta = (await screen.findByRole('heading', { name: 'Cálculo' })).closest('article')
        await userEvent.click(within(tarjeta).getByRole('button', { name: 'Ver QR' }))

        const modal = screen.getByRole('dialog', { name: 'QR · Cálculo' })
        expect(modal).toHaveAttribute('open')
        expect(within(modal).getByRole('img', { name: 'Código QR de la clase Cálculo' }))
            .toHaveAttribute('src', `data:image/png;base64,${QR_PNG}`)

        await userEvent.click(within(modal).getByRole('button', { name: 'Cerrar' }))
        expect(modal).not.toHaveAttribute('open')
    })

    it('crea una clase y vuelve a cargar la lista', async () => {
        const api = apiDocente([{ metodo: 'POST', ruta: '/api/clases/creacion', estado: 201, cuerpo: { id: 3 } }])
        renderizar()
        await screen.findByRole('heading', { name: 'Cálculo' })

        await userEvent.click(screen.getByRole('button', { name: 'Crear clase' }))
        await userEvent.type(screen.getByLabelText('Nombre clase'), 'Química')
        fireEvent.change(screen.getByLabelText('Hora / día'), { target: { value: '2026-10-05T09:30' } })
        await userEvent.click(screen.getByRole('button', { name: 'Crear' }))

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Clase creada exitosamente'))
        const [[, opciones]] = llamadasA(api, '/api/clases/creacion', 'POST')
        expect(JSON.parse(opciones.body)).toEqual({ materia: 'Química', horario: '2026-10-05T09:30' })
        expect(opciones.headers.Authorization).toBe('Bearer jwt.docente')
        expect(llamadasA(api, '/api/clases/consultar')).toHaveLength(2)
        expect(screen.getByLabelText('Nombre clase')).toHaveValue('')
    })

    it('no envía el formulario de crear clase vacío', async () => {
        const api = apiDocente()
        renderizar()
        await screen.findByRole('heading', { name: 'Cálculo' })

        await userEvent.click(screen.getByRole('button', { name: 'Crear clase' }))
        await userEvent.click(screen.getByRole('button', { name: 'Crear' }))

        expect(llamadasA(api, '/api/clases/creacion', 'POST')).toHaveLength(0)
    })

    it('elimina una clase cuando el servidor lo confirma', async () => {
        const api = apiDocente([{ metodo: 'DELETE', ruta: '/api/clases/eliminar', cuerpo: {} }])
        renderizar()
        const tarjeta = (await screen.findByRole('heading', { name: 'Cálculo' })).closest('article')

        await userEvent.click(within(tarjeta).getByRole('button', { name: 'Eliminar' }))

        await waitFor(() => expect(screen.queryByRole('heading', { name: 'Cálculo' })).not.toBeInTheDocument())
        expect(llamadasA(api, '/api/clases/eliminar', 'DELETE')[0][0]).toContain('clase_id=1')
    })

    it('si el servidor rechaza el borrado, la clase sigue en la lista', async () => {
        apiDocente([{ metodo: 'DELETE', ruta: '/api/clases/eliminar', estado: 403, cuerpo: { detail: 'No' } }])
        vi.spyOn(console, 'error').mockImplementation(() => {})
        renderizar()
        const tarjeta = (await screen.findByRole('heading', { name: 'Cálculo' })).closest('article')

        await userEvent.click(within(tarjeta).getByRole('button', { name: 'Eliminar' }))

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al eliminar la clase'))
        expect(screen.getByRole('heading', { name: 'Cálculo' })).toBeInTheDocument()
    })

    it('muestra la asistencia de una clase y permite volver', async () => {
        apiDocente([{
            ruta: '/api/asistencia/consulta',
            cuerpo: { id_clase: 1, asistencia_estudiantes: [{ id: 9, nombre: 'Luis', apellido: 'Pérez', email: 'luis@presente.dev' }] },
        }])
        renderizar()
        await screen.findByRole('heading', { name: 'Cálculo' })

        await userEvent.click(screen.getByRole('button', { name: 'Registro clases' }))
        const tarjeta = screen.getByRole('heading', { name: 'Cálculo' }).closest('article')
        await userEvent.click(within(tarjeta).getByRole('button', { name: 'Asistencia' }))

        expect(await screen.findByRole('heading', { name: 'Asistencia · Cálculo' })).toBeInTheDocument()
        expect(screen.getByText('Luis Pérez')).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: '← Volver' }))
        expect(screen.getByRole('heading', { name: 'Registro clases' })).toBeInTheDocument()
    })

    it('cerrar sesión borra la sesión y vuelve al inicio', async () => {
        apiDocente()
        renderizar()
        await screen.findByRole('heading', { name: 'Cálculo' })

        await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

        expect(screen.getByTestId('ruta')).toHaveTextContent('/')
        expect(localStorage.getItem('token')).toBeNull()
    })
})
