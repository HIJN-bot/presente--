// Traduce a un mensaje legible los errores que devuelve el Back-End.
//
// FastAPI usa dos formatos distintos para el campo "detail":
//   - HTTPException  -> un texto:  {"detail": "Ese correo ya esta registrado"}
//   - Validacion     -> una lista: {"detail": [{"type": "string_too_short", ...}]}
//
// Sin esto el Front solo puede mostrar "Error 422", que no le dice al usuario
// que fue lo que hizo mal.

// Mensajes propios para las validaciones que el usuario puede corregir.
// La clave es "campo:tipo" segun lo que envia Pydantic.
const MENSAJES = {
    'contrasena:string_too_short': 'La contraseña debe tener al menos 8 caracteres',
    'contrasena:string_too_long': 'La contraseña no puede superar los 72 caracteres',
    'email:value_error': 'El correo electrónico no es válido',
    'nombre:string_too_short': 'El nombre no puede estar vacío',
    'apellido:string_too_short': 'El apellido no puede estar vacío',
}

export async function leerMensajeDeError(respuesta) {
    let datos
    try {
        datos = await respuesta.json()
    } catch {
        // La respuesta no era JSON (error de proxy, timeout, HTML de error...)
        return `No se pudo contactar con el servidor (${respuesta.status})`
    }

    const detalle = datos?.detail

    // Caso HTTPException: el backend ya envia un texto pensado para el usuario
    if (typeof detalle === 'string') {
        return detalle
    }

    // Caso validacion: nos quedamos con el ultimo elemento de "loc", que es el
    // nombre del campo, y buscamos un mensaje propio para esa combinacion
    if (Array.isArray(detalle)) {
        const mensajes = detalle.map((error) => {
            const campo = error.loc?.[error.loc.length - 1]
            return MENSAJES[`${campo}:${error.type}`] || error.msg
        })
        // Sin duplicados, por si varios campos fallan por el mismo motivo
        return [...new Set(mensajes)].join('. ')
    }

    return `Ocurrió un error inesperado (${respuesta.status})`
}
