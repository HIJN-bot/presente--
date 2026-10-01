// Selector Estudiante / Docente usado en Login y Registro
export default function SelectorRol({ esDocente, onCambiar }) {
    const opciones = [
        { etiqueta: 'Estudiante', valor: false },
        { etiqueta: 'Docente', valor: true },
    ]

    return (
        <div role='group' aria-label='Tipo de cuenta' className='flex gap-2 rounded-full border border-borde bg-fondo p-1.5'>
            {opciones.map(({ etiqueta, valor }) => (
                <button
                    key={etiqueta}
                    type='button'
                    onClick={() => onCambiar(valor)}
                    aria-pressed={esDocente === valor}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${esDocente === valor
                        ? 'bg-acento text-acento-texto shadow'
                        : 'text-texto-suave hover:text-texto'
                        }`}
                >
                    {etiqueta}
                </button>
            ))}
        </div>
    )
}
