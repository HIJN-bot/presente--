import { describe, expect, it } from 'vitest'
import { leerMensajeDeError } from './errores'

const respuesta = (cuerpo, status = 400) =>
    new Response(typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo), { status })

describe('leerMensajeDeError', () => {
    it('devuelve el texto de una HTTPException tal cual', async () => {
        expect(await leerMensajeDeError(respuesta({ detail: 'Correo o contraseña incorrectos' }, 401)))
            .toBe('Correo o contraseña incorrectos')
    })

    it('traduce las validaciones conocidas de Pydantic', async () => {
        const cuerpo = { detail: [{ loc: ['body', 'contenido'], type: 'string_too_short', msg: 'String should have...' }] }
        expect(await leerMensajeDeError(respuesta(cuerpo, 422))).toBe('La nota no puede estar vacía')
    })

    it('usa el mensaje original si la validación no tiene traducción', async () => {
        const cuerpo = { detail: [{ loc: ['query', 'x'], type: 'otro', msg: 'mensaje original' }] }
        expect(await leerMensajeDeError(respuesta(cuerpo, 422))).toBe('mensaje original')
    })

    it('une varios errores sin repetir mensajes', async () => {
        const cuerpo = {
            detail: [
                { loc: ['body', 'nombre'], type: 'string_too_short' },
                { loc: ['body', 'contrasena'], type: 'string_too_short' },
                { loc: ['body', 'nombre'], type: 'string_too_short' },
            ],
        }
        expect(await leerMensajeDeError(respuesta(cuerpo, 422)))
            .toBe('El nombre no puede estar vacío. La contraseña debe tener al menos 8 caracteres')
    })

    it('avisa cuando la respuesta no es JSON', async () => {
        expect(await leerMensajeDeError(respuesta('<html>Bad Gateway</html>', 502)))
            .toBe('No se pudo contactar con el servidor (502)')
    })

    it('tiene un mensaje genérico para formatos desconocidos', async () => {
        expect(await leerMensajeDeError(respuesta({ algo: 1 }, 500))).toBe('Ocurrió un error inesperado (500)')
    })
})
