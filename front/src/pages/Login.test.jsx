import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login'
import Registro from './Registro'
import { llamadasA, renderizarEn, simularApi } from '../test/utils'

const usuario = { nombre: 'Ana', apellido: 'Ruiz', email: 'ana@presente.dev' }

async function completarLogin(email = 'ana@presente.dev', contrasena = 'clave-de-prueba') {
    await userEvent.type(screen.getByLabelText('Correo electrónico'), email)
    await userEvent.type(screen.getByLabelText('Contraseña'), contrasena)
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

describe('Login', () => {
    it('inicia sesión como estudiante, guarda la sesión y va a su panel', async () => {
        const api = simularApi([
            { metodo: 'POST', ruta: '/api/estudiantes/login', cuerpo: { token: 'jwt.est', role: 'student', user: usuario } },
        ])
        renderizarEn('/login', '/login', <Login />)

        await completarLogin()

        expect(await screen.findByTestId('ruta')).toHaveTextContent('/estudiante')
        const [[, opciones]] = llamadasA(api, '/api/estudiantes/login', 'POST')
        expect(JSON.parse(opciones.body)).toEqual({ email: 'ana@presente.dev', contrasena: 'clave-de-prueba' })
        expect(localStorage.getItem('token')).toBe('jwt.est')
        expect(localStorage.getItem('role')).toBe('student')
        expect(JSON.parse(localStorage.getItem('user'))).toEqual(usuario)
    })

    it('con el selector en Docente usa el login de docentes y va al panel docente', async () => {
        const api = simularApi([
            { metodo: 'POST', ruta: '/api/docentes/login', cuerpo: { token: 'jwt.doc', role: 'teacher', user: usuario } },
        ])
        renderizarEn('/login', '/login', <Login />)

        await userEvent.click(screen.getByRole('button', { name: 'Docente' }))
        await completarLogin()

        expect(await screen.findByTestId('ruta')).toHaveTextContent('/docente')
        expect(llamadasA(api, '/api/docentes/login', 'POST')).toHaveLength(1)
    })

    it('si venía de escanear un QR, vuelve a registrar la asistencia', async () => {
        simularApi([
            { metodo: 'POST', ruta: '/api/estudiantes/login', cuerpo: { token: 't', role: 'student', user: usuario } },
        ])
        localStorage.setItem('idClase', '42')
        renderizarEn('/login', '/login', <Login />)

        await completarLogin()

        expect(await screen.findByTestId('ruta')).toHaveTextContent('/asistencia?clase_id=42')
        expect(localStorage.getItem('idClase')).toBeNull()
    })

    it('muestra el error del servidor y no guarda sesión', async () => {
        simularApi([
            { metodo: 'POST', ruta: '/api/estudiantes/login', estado: 401, cuerpo: { detail: 'Correo o contraseña incorrectos' } },
        ])
        renderizarEn('/login', '/login', <Login />)

        await completarLogin()

        expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
        expect(localStorage.getItem('token')).toBeNull()
        expect(screen.getByTestId('ruta')).toHaveTextContent('/login')
    })
})

describe('Registro', () => {
    it('crea una cuenta de docente y entra a su panel', async () => {
        const api = simularApi([
            { metodo: 'POST', ruta: '/api/docentes/registro', estado: 201, cuerpo: { token: 'jwt', role: 'teacher', user: usuario } },
        ])
        renderizarEn('/registro', '/registro', <Registro />)

        await userEvent.click(screen.getByRole('button', { name: 'Docente' }))
        await userEvent.type(screen.getByLabelText('Nombre'), 'Ana')
        await userEvent.type(screen.getByLabelText('Apellido'), 'Ruiz')
        await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@presente.dev')
        await userEvent.type(screen.getByLabelText('Contraseña'), 'clave-de-prueba')
        await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

        expect(await screen.findByTestId('ruta')).toHaveTextContent('/docente')
        const [[, opciones]] = llamadasA(api, '/api/docentes/registro', 'POST')
        expect(JSON.parse(opciones.body)).toEqual({
            nombre: 'Ana', apellido: 'Ruiz', email: 'ana@presente.dev', contrasena: 'clave-de-prueba',
        })
    })

    it('declara los mismos límites de contraseña que valida el backend', () => {
        // jsdom no aplica minLength al enviar (validity.tooShort siempre es false),
        // así que comprobamos la restricción; el navegador real bloquea el envío
        // y el backend responde 422 (tests/integracion/test_autenticacion.py).
        renderizarEn('/registro', '/registro', <Registro />)
        const contrasena = screen.getByLabelText('Contraseña')
        expect(contrasena).toHaveAttribute('minLength', '8')
        expect(contrasena).toHaveAttribute('maxLength', '72')
        expect(contrasena).toBeRequired()
    })
})
