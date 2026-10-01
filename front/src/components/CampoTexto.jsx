import { useId } from 'react'

const ESTILO_CAMPO = 'w-full rounded-2xl border border-borde bg-fondo px-4 py-3 text-texto placeholder:text-texto-suave/70 transition-colors focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20'

// Campo con etiqueta asociada. Con multilinea usa <textarea>.
// Las demás props (type, value, onChange, required...) van al campo.
export default function CampoTexto({ etiqueta, ayuda, multilinea = false, ocultarEtiqueta = false, className = '', ...props }) {
    const id = useId()
    const Campo = multilinea ? 'textarea' : 'input'

    return (
        <div className={className}>
            <label
                htmlFor={id}
                className={ocultarEtiqueta ? 'sr-only' : 'mb-2 block text-sm font-semibold text-texto-suave'}
            >
                {etiqueta}
            </label>
            <Campo id={id} className={`${ESTILO_CAMPO} ${multilinea ? 'min-h-32 resize-y' : ''}`} {...props} />
            {ayuda && <p className='mt-2 text-xs text-texto-suave'>{ayuda}</p>}
        </div>
    )
}
