// Datos de sesión guardados en localStorage por Login y Registro.

const CLAVES_SESION = ['token', 'role', 'user']

// Devuelve el usuario guardado o null si no hay sesión (o el dato está dañado)
export function obtenerUsuario() {
    try {
        return JSON.parse(localStorage.getItem('user'))
    } catch {
        return null
    }
}

// Borra solo los datos de sesión. No usamos localStorage.clear() porque
// también eliminaría preferencias como el tema.
export function cerrarSesion() {
    CLAVES_SESION.forEach((clave) => localStorage.removeItem(clave))
}
