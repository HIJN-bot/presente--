import { describe, expect, it, vi } from 'vitest'
import { cerrarSesion, fetchConSesion, obtenerToken, obtenerUsuario } from './sesion'
import { iniciarSesionSimulada } from './test/utils'

describe('obtenerUsuario', () => {
    it('devuelve null si no hay sesión', () => {
        expect(obtenerUsuario()).toBeNull()
    })

    it('devuelve el usuario guardado', () => {
        iniciarSesionSimulada({ nombre: 'Ana', email: 'ana@presente.dev' })
        expect(obtenerUsuario()).toMatchObject({ nombre: 'Ana', email: 'ana@presente.dev' })
    })

    it('devuelve null si el dato guardado está dañado', () => {
        localStorage.setItem('user', '{no es json')
        expect(obtenerUsuario()).toBeNull()
    })
})

describe('cerrarSesion', () => {
    it('borra solo los datos de sesión y conserva las preferencias', () => {
        iniciarSesionSimulada()
        localStorage.setItem('tema', 'oscuro')
        localStorage.setItem('idClase', '7')

        cerrarSesion()

        expect(obtenerToken()).toBeNull()
        expect(localStorage.getItem('role')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
        expect(localStorage.getItem('tema')).toBe('oscuro')
        expect(localStorage.getItem('idClase')).toBe('7')
    })
})

describe('fetchConSesion', () => {
    const respuestaOk = () => new Response('{}', { status: 200 })

    it('envía el token en la cabecera Authorization', async () => {
        iniciarSesionSimulada({ token: 'abc.def.ghi' })
        const fetch = vi.fn(async () => respuestaOk())
        vi.stubGlobal('fetch', fetch)

        await fetchConSesion('http://api.test/x')

        expect(fetch.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer abc.def.ghi' })
    })

    it('conserva el método, el cuerpo y las demás cabeceras', async () => {
        iniciarSesionSimulada({ token: 't' })
        const fetch = vi.fn(async () => respuestaOk())
        vi.stubGlobal('fetch', fetch)

        await fetchConSesion('http://api.test/x', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"a":1}',
        })

        expect(fetch.mock.calls[0][1]).toEqual({
            method: 'POST',
            body: '{"a":1}',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        })
    })

    it('no envía Authorization si no hay token', async () => {
        const fetch = vi.fn(async () => respuestaOk())
        vi.stubGlobal('fetch', fetch)

        await fetchConSesion('http://api.test/x')

        expect(fetch.mock.calls[0][1].headers).toEqual({})
    })

    it('con 401 borra la sesión y devuelve la respuesta', async () => {
        // La redirección a /login (window.location.assign) no se puede observar en
        // jsdom; se comprueba en el navegador real. Aquí validamos la sesión.
        iniciarSesionSimulada()
        localStorage.setItem('tema', 'claro')
        vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })))
        vi.spyOn(console, 'error').mockImplementation(() => {})

        const respuesta = await fetchConSesion('http://api.test/x')

        expect(respuesta.status).toBe(401)
        expect(obtenerToken()).toBeNull()
        expect(obtenerUsuario()).toBeNull()
        expect(localStorage.getItem('tema')).toBe('claro')
    })

    it('con 403 no toca la sesión', async () => {
        iniciarSesionSimulada()
        vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 403 })))

        await fetchConSesion('http://api.test/x')

        expect(obtenerToken()).not.toBeNull()
    })
})
