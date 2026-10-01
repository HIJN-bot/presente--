import useTema from '../hooks/useTema'

// Botón luna/sol del header: muestra el ícono del modo al que se cambia
export default function BotonTema() {
    const { oscuro, alternarTema } = useTema()
    const etiqueta = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'

    return (
        <button
            type='button'
            onClick={alternarTema}
            aria-label={etiqueta}
            title={etiqueta}
            className='grid size-10 place-items-center rounded-full text-texto transition-colors hover:bg-superficie-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento'
        >
            {oscuro ? (
                // Sol
                <svg viewBox='0 0 24 24' className='size-5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'>
                    <circle cx='12' cy='12' r='4' />
                    <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' />
                </svg>
            ) : (
                // Luna
                <svg viewBox='0 0 24 24' className='size-5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                    <path d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z' />
                </svg>
            )}
        </button>
    )
}
