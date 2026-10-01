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

// Token de sesión (JWT) que devuelve el backend al iniciar sesión o registrarse
export function obtenerToken() {
    return localStorage.getItem('token')
}

// Borra solo los datos de sesión. No usamos localStorage.clear() porque
// también eliminaría preferencias como el tema.
export function cerrarSesion() {
    CLAVES_SESION.forEach((clave) => localStorage.removeItem(clave))
}

// fetch para los endpoints que requieren sesión: agrega el token en la cabecera
// Authorization. Si el backend responde 401 (sin token, token alterado o vencido)
// borramos la sesión y llevamos al usuario a iniciar sesión de nuevo.
export async function fetchConSesion(url, opciones = {}) {
    const token = obtenerToken()
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            ...opciones.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    })

    if (respuesta.status === 401) {
        cerrarSesion()
        window.location.assign('/login')
    }
    return respuesta
}
