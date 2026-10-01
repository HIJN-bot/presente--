import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from './Header'
import MenuLateral from './MenuLateral'

const ENLACES = [
    { a: '/', etiqueta: 'Inicio' },
    { a: '/login', etiqueta: 'Iniciar sesión' },
    { a: '/registro', etiqueta: 'Crear cuenta' },
]

// Estructura de las páginas sin sesión (inicio, login, registro, asistencia):
// Header con hamburguesa que abre los enlaces principales.
export default function PaginaPublica({ titulo = 'Presente', children }) {
    const [menuAbierto, setMenuAbierto] = useState(false)
    const { pathname } = useLocation()

    return (
        <div className='min-h-dvh'>
            <Header titulo={titulo} onMenu={() => setMenuAbierto(true)} menuAbierto={menuAbierto} />

            <MenuLateral abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} titulo='Presente'>
                <nav aria-label='Principal' className='flex flex-col gap-3'>
                    {ENLACES.map(({ a, etiqueta }) => (
                        <Link
                            key={a}
                            to={a}
                            onClick={() => setMenuAbierto(false)}
                            aria-current={pathname === a ? 'page' : undefined}
                            className={`rounded-2xl border px-4 py-3 font-semibold transition-colors ${pathname === a
                                ? 'border-acento bg-acento text-acento-texto'
                                : 'border-borde text-texto hover:bg-superficie-alt'
                                }`}
                        >
                            {etiqueta}
                        </Link>
                    ))}
                </nav>
            </MenuLateral>

            {children}
        </div>
    )
}
