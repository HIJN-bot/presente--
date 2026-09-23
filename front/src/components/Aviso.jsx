// Mensaje de error o de éxito que se muestra sobre un formulario o una lista
export default function Aviso({ tipo = 'error', children }) {
    if (!children) return null

    const estilos = tipo === 'error'
        ? 'border-peligro/40 bg-peligro/10 text-peligro'
        : 'border-exito/40 bg-exito/10 text-exito'

    return (
        <div role={tipo === 'error' ? 'alert' : 'status'} className={`rounded-2xl border px-4 py-3 text-sm ${estilos}`}>
            {children}
        </div>
    )
}
