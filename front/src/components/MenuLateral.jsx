import { useEffect } from 'react'

// Panel deslizable desde la izquierda que abre la hamburguesa.
// Se cierra con Escape, con el botón ✕ o tocando fuera del panel.
export default function MenuLateral({ abierto, onCerrar, titulo = 'Menú', children }) {
    useEffect(() => {
        if (!abierto) return
        const alPresionarTecla = (e) => {
            if (e.key === 'Escape') onCerrar()
        }
        document.addEventListener('keydown', alPresionarTecla)
        return () => document.removeEventListener('keydown', alPresionarTecla)
    }, [abierto, onCerrar])

    return (
        <div className={`fixed inset-0 z-40 ${abierto ? '' : 'pointer-events-none'}`} aria-hidden={!abierto}>
            {/* Fondo oscurecido */}
            <div
                onClick={onCerrar}
                className={`absolute inset-0 bg-black/40 transition-opacity ${abierto ? 'opacity-100' : 'opacity-0'}`}
            />

            <aside
                role='dialog'
                aria-modal='true'
                aria-label={titulo}
                inert={!abierto}
                className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-6 border-r border-borde bg-superficie p-5 shadow-xl transition-transform ${abierto ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className='flex items-center justify-between'>
                    <span className='font-display text-lg font-bold'>{titulo}</span>
                    <button
                        type='button'
                        onClick={onCerrar}
                        aria-label='Cerrar menú'
                        className='grid size-9 place-items-center rounded-full hover:bg-superficie-alt'
                    >
                        <svg viewBox='0 0 24 24' className='size-5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'>
                            <path d='M6 6l12 12M18 6L6 18' />
                        </svg>
                    </button>
                </div>
                {children}
            </aside>
        </div>
    )
}
