// Pruebas end-to-end: las páginas reales del Front contra la API real (base de pruebas).
//
// 1. Levantar el backend de pruebas (base "<nombre>_test", puerto 8001):
//      back/venv/Scripts/python.exe back/tests/servidor_e2e.py
// 2. Ejecutar (bash):        E2E_API_URL=http://127.0.0.1:8001 npm run test:e2e
//    Ejecutar (PowerShell):  $env:E2E_API_URL='http://127.0.0.1:8001'; npm run test:e2e
//
// Los usuarios se crean por la API con un correo único y una contraseña aleatoria
// generada en cada ejecución: no hay credenciales escritas en el código.

import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderizarEn, simularPantalla } from '../test/utils'

const API = process.env.E2E_API_URL
// config.js lee la URL de la API al importarse: la fijamos antes de cargar las páginas
window.API_BASE_URL = API
const { default: PanelDocente } = await import('../pages/PanelDocente')
const { default: PanelEstudiante } = await import('../pages/PanelEstudiante')
const { default: Asistencia } = await import('../pages/Asistencia')

const sufijo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const DOCENTE = { nombre: 'Ana', apellido: 'Ruiz', email: `e2e.docente.${sufijo}@presente.dev` }
const ESTUDIANTE = { nombre: 'Luis', apellido: 'Pérez', email: `e2e.estudiante.${sufijo}@presente.dev` }
const MATERIA = `Cálculo E2E ${sufijo}`
const tokens = {}

async function api(ruta, { metodo = 'GET', cuerpo, token } = {}) {
    const respuesta = await fetch(`${API}${ruta}`, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: cuerpo && JSON.stringify(cuerpo),
    })
    return { estado: respuesta.status, datos: await respuesta.json() }
}

function sesionDe(usuario, token, rol) {
    localStorage.setItem('token', token)
    localStorage.setItem('role', rol)
    localStorage.setItem('user', JSON.stringify(usuario))
}

async function idDeLaClase() {
    const { datos } = await api(`/api/clases/consultar?email_docente=${DOCENTE.email}`, { token: tokens.docente })
    return datos.find((c) => c.materia === MATERIA).id
}

beforeAll(async () => {
    const salud = await fetch(`${API}/`).catch(() => null)
    if (!salud?.ok) throw new Error(`No responde el backend de pruebas en ${API}`)

    for (const [clave, rol, usuario] of [['docente', 'docentes', DOCENTE], ['estudiante', 'estudiantes', ESTUDIANTE]]) {
        const { estado, datos } = await api(`/api/${rol}/registro`, {
            metodo: 'POST',
            cuerpo: { ...usuario, contrasena: crypto.randomUUID() },
        })
        expect(estado).toBe(201)
        tokens[clave] = datos.token
    }
})

describe('Flujo completo contra la API real', () => {
    it('el docente crea una clase desde su panel y ve su QR', async () => {
        simularPantalla('escritorio')
        vi.spyOn(window, 'alert').mockImplementation(() => {})
        sesionDe(DOCENTE, tokens.docente, 'teacher')
        renderizarEn('/docente', '/docente', <PanelDocente />)

        await userEvent.click(screen.getByRole('button', { name: 'Crear clase' }))
        await userEvent.type(screen.getByLabelText('Nombre clase'), MATERIA)
        fireEvent.change(screen.getByLabelText('Hora / día'), { target: { value: '2026-10-01T08:00' } })
        await userEvent.click(screen.getByRole('button', { name: 'Crear' }))
        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Clase creada exitosamente'))

        await userEvent.click(screen.getByRole('button', { name: 'Clases programadas' }))
        const tarjeta = screen.getByRole('heading', { name: MATERIA }).closest('article')
        expect(within(tarjeta).getByText('0 estudiantes')).toBeInTheDocument()
        await userEvent.click(within(tarjeta).getByRole('button', { name: 'Ver QR' }))
        const qr = screen.getByRole('img', { name: `Código QR de la clase ${MATERIA}` })
        // El QR generado por el backend es un PNG real en base64
        expect(qr.getAttribute('src')).toMatch(/^data:image\/png;base64,iVBORw0KGgo/)
    })

    it('el estudiante registra su asistencia al abrir el enlace del QR', async () => {
        const idClase = await idDeLaClase()
        sesionDe(ESTUDIANTE, tokens.estudiante, 'student')
        renderizarEn(`/asistencia?clase_id=${idClase}`, '/asistencia', <Asistencia />)

        expect(await screen.findByRole('heading', { name: 'Asistencia registrada' })).toBeInTheDocument()
    })

    it('el panel del estudiante muestra la clase y guarda sus notas', async () => {
        simularPantalla('escritorio')
        sesionDe(ESTUDIANTE, tokens.estudiante, 'student')
        renderizarEn('/estudiante', '/estudiante', <PanelEstudiante />)

        expect(await screen.findByRole('heading', { name: MATERIA })).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Notas' }))
        await userEvent.type(screen.getByLabelText('Deja una nota aquí'), '  Nota desde la prueba E2E  ')
        await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))
        expect(await screen.findByText('Nota desde la prueba E2E')).toBeInTheDocument()

        const { datos } = await api(`/api/notas/consultar?email_estudiante=${ESTUDIANTE.email}`, { token: tokens.estudiante })
        expect(datos.map((n) => n.contenido)).toEqual(['Nota desde la prueba E2E'])
    })

    it('el docente ve al estudiante en la asistencia de la clase', async () => {
        simularPantalla('escritorio')
        sesionDe(DOCENTE, tokens.docente, 'teacher')
        renderizarEn('/docente', '/docente', <PanelDocente />)

        const tarjeta = (await screen.findByRole('heading', { name: MATERIA })).closest('article')
        expect(within(tarjeta).getByText('1 estudiante')).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Registro clases' }))
        const tarjetaRegistro = screen.getByRole('heading', { name: MATERIA }).closest('article')
        await userEvent.click(within(tarjetaRegistro).getByRole('button', { name: 'Asistencia' }))
        expect(await screen.findByText('Luis Pérez')).toBeInTheDocument()
        expect(screen.getByText(ESTUDIANTE.email)).toBeInTheDocument()
    })

    it('un token inválido no da acceso y la sesión se cierra', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        sesionDe(ESTUDIANTE, 'token-falso', 'student')
        renderizarEn('/estudiante', '/estudiante', <PanelEstudiante />)

        await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
        expect(screen.queryByRole('heading', { name: MATERIA })).not.toBeInTheDocument()
    })

    it('el docente elimina la clase y el estudiante conserva su cuenta y sus notas', async () => {
        const idClase = await idDeLaClase()
        const borrado = await api(`/api/clases/eliminar?clase_id=${idClase}`, { metodo: 'DELETE', token: tokens.docente })
        expect(borrado.estado).toBe(200)

        const historial = await api(`/api/asistencia/historial?email_estudiante=${ESTUDIANTE.email}`, { token: tokens.estudiante })
        const notas = await api(`/api/notas/consultar?email_estudiante=${ESTUDIANTE.email}`, { token: tokens.estudiante })
        expect(historial).toEqual({ estado: 200, datos: [] })
        expect(notas.datos).toHaveLength(1)
    })
})
