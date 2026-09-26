import { useState } from 'react'
import Header from './Header'
import MenuLateral from './MenuLateral'
import Boton from './Boton'
import useMediaQuery from '../hooks/useMediaQuery'

// Estructura de los paneles de docente y estudiante: Header + sidebar + contenido.
// En escritorio la sidebar es fija y la hamburguesa la oculta/muestra;
// en móvil la sidebar vive dentro del MenuLateral deslizable.
export default function PanelLayout({ titulo, nombre, secciones, seccionActiva, onSeleccionar, onCerrarSesion, children }) {
    const esEscritorio = useMediaQuery('(min-width: 64rem)')
    const [sidebarOculta, setSidebarOculta] = useState(false)
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

    const menuAbierto = esEscritorio ? !sidebarOculta : menuMovilAbierto

    const alternarMenu = () => {
        if (esEscritorio) setSidebarOculta((oculta) => !oculta)
        else setMenuMovilAbierto((abierto) => !abierto)
    }

    const seleccionar = (id) => {
        onSeleccionar(id)
        setMenuMovilAbierto(false)
    }

    const navegacion = (
        <>
            {nombre && (
                <p className='text-sm text-texto-suave'>
                    Hola, <span className='font-semibold text-texto'>{nombre}</span>
                </p>
            )}

            <nav aria-label='Secciones del panel' className='flex flex-col gap-3'>
                {secciones.map(({ id, etiqueta }) => (
                    <button
                        key={id}
                        type='button'
                        onClick={() => seleccionar(id)}
                        aria-current={seccionActiva === id ? 'page' : undefined}
                        className={`rounded-2xl border px-4 py-3 text-left font-semibold transition-colors ${seccionActiva === id
                            ? 'border-acento bg-acento text-acento-texto'
                            : 'border-borde bg-superficie text-texto hover:bg-superficie-alt'
                            }`}
                    >
                        {etiqueta}
                    </button>
                ))}
            </nav>

            <Boton variante='secundario' onClick={onCerrarSesion} className='mt-auto w-full'>
                Cerrar sesión
            </Boton>
        </>
    )

    return (
        <div className='min-h-dvh'>
            <Header titulo={titulo} onMenu={alternarMenu} menuAbierto={menuAbierto} />

            <div className='flex'>
                {esEscritorio && !sidebarOculta && (
                    <aside className='sticky top-16 flex h-[calc(100dvh-4rem)] w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-borde bg-superficie/60 p-5 backdrop-blur'>
                        {navegacion}
                    </aside>
                )}

                <main className='min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8'>
                    <div className='mx-auto max-w-5xl'>{children}</div>
                </main>
            </div>

            <MenuLateral
                abierto={!esEscritorio && menuMovilAbierto}
                onCerrar={() => setMenuMovilAbierto(false)}
                titulo={titulo}
            >
                {navegacion}
            </MenuLateral>
        </div>
    )
}
