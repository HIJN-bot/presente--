import { describe, expect, it } from 'vitest'
import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useTema from './useTema'
import BotonTema from '../components/BotonTema'

describe('useTema', () => {
    it('parte del tema que ya tiene <html>', () => {
        document.documentElement.classList.add('dark')
        const { result } = renderHook(() => useTema())
        expect(result.current.oscuro).toBe(true)
    })

    it('alterna la clase dark y guarda la preferencia', () => {
        const { result } = renderHook(() => useTema())

        act(() => result.current.alternarTema())
        expect(document.documentElement).toHaveClass('dark')
        expect(localStorage.getItem('tema')).toBe('oscuro')

        act(() => result.current.alternarTema())
        expect(document.documentElement).not.toHaveClass('dark')
        expect(localStorage.getItem('tema')).toBe('claro')
    })
})

describe('BotonTema', () => {
    it('describe la acción según el tema actual', async () => {
        render(<BotonTema />)
        const boton = screen.getByRole('button', { name: 'Cambiar a modo oscuro' })

        await userEvent.click(boton)

        expect(boton).toHaveAccessibleName('Cambiar a modo claro')
    })
})
