# Importamos de bcrypt la funcion para:
# Generar el hash, revisar el hash y generar el salt
from bcrypt import hashpw, checkpw, gensalt

# Importamos datetime para calcular la fecha de expiracion del token
from datetime import datetime, timedelta, timezone

# Importamos jwt (PyJWT) para firmar y verificar los tokens de sesion
import jwt

# Importamos la clave de firma y la duracion del token desde la configuracion
from app.config import SECRET_KEY, TOKEN_EXPIRACION_HORAS

# Algoritmo de firma: HMAC con SHA-256, usando SECRET_KEY como clave
ALGORITMO = "HS256"


# Funcion para el hash
def generar_hash(contrasena: str) -> bytes:
    """
    Recibimos la contraseña como parametro de la funcion
    Generamos el salt para generar el hash de la contraseña
    Generamos el hash para la contraseña y lo retornamos
    """
    salt = gensalt()
    hash = hashpw(contrasena.encode("utf-8"), salt)
    return hash.decode("utf-8")


# Funcion para verificar la contraseña
def verificar_hash(contrasena: str, hash_guardado: bytes | str) -> bool:
    """
    Revisamos si el hash es igual al que tenemos guardado
    Retornamos un valor booleano en base a lo anterior
    """
    # Compraramos los hashes
    hash_bytes = hash_guardado.encode("utf-8") if isinstance(hash_guardado, str) else hash_guardado
    comparacion_hashes = checkpw(contrasena.encode("utf-8"), hash_bytes)
    return comparacion_hashes


def generar_token(rol: str, email: str) -> str:
    """
    Generamos el token de sesion (JWT firmado) que el Front envia en cada peticion:
    - "sub" es el email del usuario y "rol" es "teacher" o "student"
    - "exp" hace que el token deje de ser valido pasadas TOKEN_EXPIRACION_HORAS
    - La firma impide modificar el contenido sin conocer SECRET_KEY
    """
    ahora = datetime.now(timezone.utc)
    datos = {
        "sub": email,
        "rol": rol,
        "iat": ahora,
        "exp": ahora + timedelta(hours=TOKEN_EXPIRACION_HORAS),
    }
    return jwt.encode(datos, SECRET_KEY, algorithm=ALGORITMO)


def decodificar_token(token: str) -> dict:
    """
    Verificamos la firma y la expiracion del token y retornamos su contenido.
    Lanza jwt.InvalidTokenError (o una subclase, como ExpiredSignatureError)
    si el token fue alterado, esta vencido o le faltan datos.
    """
    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITMO],
        options={"require": ["sub", "rol", "exp"]},
    )
