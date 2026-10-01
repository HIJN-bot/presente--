# Importamos de FastAPI Depends para encadenar dependencias y HTTPException para los errores
from fastapi import Depends, HTTPException

# Importamos el esquema Bearer, que lee la cabecera "Authorization: Bearer <token>"
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Importamos dataclass para representar al usuario autenticado
from dataclasses import dataclass

# Importamos jwt para capturar los errores de un token invalido
import jwt

# Importamos la funcion que verifica el token
from app.services.usuarios.auth_service import decodificar_token

# auto_error=False para responder nosotros con 401 y un mensaje en español
esquema_bearer = HTTPBearer(auto_error=False)


# Datos del usuario que vienen dentro del token ya verificado
@dataclass
class UsuarioActual:
    email: str
    rol: str


def _no_autorizado(detalle: str) -> HTTPException:
    """Error 401: falta el token o no es valido. El Front debe pedir un nuevo inicio de sesion."""
    return HTTPException(
        status_code=401, detail=detalle, headers={"WWW-Authenticate": "Bearer"}
    )


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials | None = Depends(esquema_bearer),
) -> UsuarioActual:
    """
    Dependencia para los endpoints que requieren sesion:
    - Leemos el token de la cabecera Authorization
    - Verificamos su firma y su expiracion
    - Retornamos el email y el rol del usuario
    """
    if credenciales is None:
        raise _no_autorizado("Debes iniciar sesión para continuar")
    try:
        datos = decodificar_token(credenciales.credentials)
    except jwt.ExpiredSignatureError:
        raise _no_autorizado("Tu sesión expiró, inicia sesión de nuevo")
    except jwt.InvalidTokenError:
        raise _no_autorizado("La sesión no es válida, inicia sesión de nuevo")
    return UsuarioActual(email=datos["sub"], rol=datos["rol"])


def requerir_docente(usuario: UsuarioActual = Depends(obtener_usuario_actual)) -> UsuarioActual:
    """Dependencia para los endpoints exclusivos de docentes."""
    if usuario.rol != "teacher":
        raise HTTPException(status_code=403, detail="Esta acción es solo para docentes")
    return usuario


def requerir_estudiante(usuario: UsuarioActual = Depends(obtener_usuario_actual)) -> UsuarioActual:
    """Dependencia para los endpoints exclusivos de estudiantes."""
    if usuario.rol != "student":
        raise HTTPException(status_code=403, detail="Esta acción es solo para estudiantes")
    return usuario


def verificar_propietario(email: str, usuario: UsuarioActual) -> None:
    """
    Comprobamos que el email de la peticion (el dueño de los datos) sea el del token.
    Asi un usuario autenticado no puede consultar ni modificar datos de otro.
    """
    if email.lower() != usuario.email.lower():
        raise HTTPException(
            status_code=403, detail="No tienes permiso para acceder a estos datos"
        )
