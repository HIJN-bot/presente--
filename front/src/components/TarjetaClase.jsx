import Tarjeta from './Tarjeta'

// Tarjeta de una clase: nombre, fecha/hora, un detalle opcional y acciones.
// La usan el panel docente (Ver QR, Asistencia) y el panel estudiante.
export default function TarjetaClase({ materia, horario, detalle, children }) {
    return (
        <Tarjeta as='article' className='flex flex-col gap-4'>
            <div>
                <h3 className='font-display text-lg font-bold break-words'>{materia}</h3>
                {horario && (
                    <p className='mt-1 text-sm text-texto-suave'>
                        <time dateTime={horario}>{formatearFecha(horario)}</time>
                    </p>
                )}
                {detalle && <p className='mt-1 text-sm text-texto-suave'>{detalle}</p>}
            </div>
            {children && <div className='mt-auto flex flex-wrap gap-2'>{children}</div>}
        </Tarjeta>
    )
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
}
