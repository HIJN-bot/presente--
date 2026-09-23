import { Link } from 'react-router-dom'

const VARIANTES = {
    primario: 'bg-acento text-acento-texto hover:bg-acento-hover',
    secundario: 'border border-borde bg-superficie text-texto hover:bg-superficie-alt',
    peligro: 'bg-peligro text-white hover:bg-peligro-hover dark:text-fondo',
}

// Botón redondeado reutilizable. Si recibe "to" se renderiza como Link.
export default function Boton({ variante = 'primario', to, className = '', type = 'button', ...props }) {
    const clases = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento ${VARIANTES[variante]} ${className}`

    if (to) {
        return <Link to={to} className={clases} {...props} />
    }
    return <button type={type} className={clases} {...props} />
}
