// Título de sección con la línea punteada que separa las secciones en los bocetos
export default function TituloSeccion({ children, accion }) {
    return (
        <div className='mb-6 flex flex-wrap items-center gap-3 border-b border-dashed border-borde pb-4'>
            {accion}
            <h2 className='font-display text-2xl font-bold sm:text-3xl'>{children}</h2>
        </div>
    )
}
