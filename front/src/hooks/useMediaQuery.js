import { useSyncExternalStore } from 'react'

// Devuelve true mientras la media query se cumpla y se actualiza al redimensionar
export default function useMediaQuery(consulta) {
    return useSyncExternalStore(
        (avisar) => {
            const lista = window.matchMedia(consulta)
            lista.addEventListener('change', avisar)
            return () => lista.removeEventListener('change', avisar)
        },
        () => window.matchMedia(consulta).matches
    )
}
