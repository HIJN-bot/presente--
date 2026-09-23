import { useEffect, useRef } from 'react'

// Ventana modal basada en <dialog>: el navegador se encarga del foco,
// de cerrar con Escape y de bloquear el contenido de atrás.
export default function Modal({ abierto, onCerrar, titulo, children }) {
    const dialogoRef = useRef(null)

    useEffect(() => {
        const dialogo = dialogoRef.current
        if (abierto && !dialogo.open) dialogo.showModal()
        if (!abierto && dialogo.open) dialogo.close()
    }, [abierto])

    return (
        <dialog
            ref={dialogoRef}
            onClose={onCerrar}
            // Cerrar al hacer clic en el fondo (fuera del contenido)
            onClick={(e) => e.target === dialogoRef.current && onCerrar()}
            aria-label={titulo}
            className='m-auto w-[min(26rem,calc(100vw-2rem))] rounded-3xl border border-borde bg-superficie p-0 text-texto shadow-2xl backdrop:bg-black/50'
        >
            <div className='p-6'>
                <div className='mb-4 flex items-start justify-between gap-4'>
                    <h2 className='font-display text-xl font-bold'>{titulo}</h2>
                    <button
                        type='button'
                        onClick={onCerrar}
                        aria-label='Cerrar'
                        className='grid size-9 shrink-0 place-items-center rounded-full hover:bg-superficie-alt'
                    >
                        <svg viewBox='0 0 24 24' className='size-5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'>
                            <path d='M6 6l12 12M18 6L6 18' />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </dialog>
    )
}
