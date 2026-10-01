// Contenedor redondeado con borde: la "caja" de los bocetos
export default function Tarjeta({ as: Etiqueta = 'div', className = '', ...props }) {
    return (
        <Etiqueta
            className={`rounded-3xl border border-borde bg-superficie p-5 shadow-sm sm:p-6 ${className}`}
            {...props}
        />
    )
}
