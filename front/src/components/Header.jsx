import BotonTema from './BotonTema'

// Header común de todas las páginas: hamburguesa, título centrado y tema
export default function Header({ titulo, onMenu, menuAbierto = false }) {
    return (
        <header className='sticky top-0 z-30 grid h-16 grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-borde bg-fondo px-3 sm:px-6'>
            <button
                type='button'
                onClick={onMenu}
                aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuAbierto}
                className='grid size-10 place-items-center rounded-full text-texto transition-colors hover:bg-superficie-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento'
            >
                <svg viewBox='0 0 24 24' className='size-6' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'>
                    <path d='M4 6h16M4 12h16M4 18h16' />
                </svg>
            </button>

            <h1 className='truncate text-center font-display text-xl font-bold sm:text-2xl'>{titulo}</h1>

            <BotonTema />
        </header>
    )
}
