import { useState } from 'react'

// Tema claro/oscuro de la aplicación.
// El script de index.html ya aplicó la clase .dark antes del primer render
// (preferencia guardada o, si no hay, la del sistema), así que el estado
// inicial se lee directamente de <html>.
export default function useTema() {
    const [oscuro, setOscuro] = useState(
        () => document.documentElement.classList.contains('dark')
    )

    const alternarTema = () => {
        const siguiente = !oscuro
        document.documentElement.classList.toggle('dark', siguiente)
        try {
            localStorage.setItem('tema', siguiente ? 'oscuro' : 'claro')
        } catch {
            // Sin localStorage el cambio solo dura hasta recargar
        }
        setOscuro(siguiente)
    }

    return { oscuro, alternarTema }
}
