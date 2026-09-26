import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Inicio from './Inicio'
import PanelLayout from '../components/PanelLayout'
import { renderizarEn, simularPantalla } from '../test/utils'

describe('Inicio (homepage)', () => {
    it('muestra el contenido del boceto', () => {
        renderizarEn('/', '/', <Inicio />)

        expect(screen.getByRole('heading', { level: 1, name: 'Presente' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Automatiza el proceso de asistencia' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Iniciar' })).toHaveAttribute('href', '/login')
        expect(screen.getByRole('heading', { name: 'Con Presente' })).toBeInTheDocument()
        for (const titulo of [
            'Crea tus clases en segundos',
            'Tus estudiantes escanean el QR',
            'Consulta la asistencia cuando quieras',
        ]) {
            expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument()
        }
        expect(screen.getByRole('img', { name: 'Estudiantes levantando la mano en clase' })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Celular escaneando el código QR de una clase' })).toBeInTheDocument()
    })

    it('la hamburguesa abre el menú con los enlaces y Escape lo cierra', async () => {
        renderizarEn('/', '/', <Inicio />)
        expect(screen.queryByRole('link', { name: 'Crear cuenta' })).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
        const menu = screen.getByRole('dialog', { name: 'Presente' })
        expect(within(menu).getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
        expect(within(menu).getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/registro')

        await userEvent.keyboard('{Escape}')
        expect(screen.queryByRole('link', { name: 'Crear cuenta' })).not.toBeInTheDocument()
    })
})

describe('PanelLayout (responsive)', () => {
    const secciones = [{ id: 'a', etiqueta: 'Sección A' }, { id: 'b', etiqueta: 'Sección B' }]

    function renderizarPanel(onSeleccionar = () => {}) {
        return renderizarEn('/', '/', (
            <PanelLayout titulo='Panel' nombre='Eva' secciones={secciones} seccionActiva='a'
                onSeleccionar={onSeleccionar} onCerrarSesion={() => {}}>
                <p>Contenido</p>
            </PanelLayout>
        ))
    }

    it('en escritorio la sidebar es fija y la hamburguesa la oculta y la muestra', async () => {
        simularPantalla('escritorio')
        renderizarPanel()
        const nav = () => screen.queryByRole('navigation', { name: 'Secciones del panel' })

        expect(nav()).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sección A' })).toHaveAttribute('aria-current', 'page')

        await userEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }))
        expect(nav()).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
        expect(nav()).toBeInTheDocument()
    })

    it('en móvil las secciones están en el menú deslizable, que se cierra al elegir una', async () => {
        const onSeleccionar = vi.fn()
        renderizarPanel(onSeleccionar)
        expect(screen.queryByRole('navigation', { name: 'Secciones del panel' })).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
        const menu = screen.getByRole('dialog', { name: 'Panel' })
        await userEvent.click(within(menu).getByRole('button', { name: 'Sección B' }))

        expect(onSeleccionar).toHaveBeenCalledWith('b')
        expect(screen.queryByRole('dialog', { name: 'Panel' })).not.toBeInTheDocument()
    })
})
