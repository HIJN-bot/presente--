# Importamos de bcrypt la funcion para:
# Generar el hash, revisar el hash y generar el salt
from bcrypt import hashpw, checkpw, gensalt

# Importamos secrets para generar tokens opacos simples para el MVP
import secrets


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
    Generamos un token opaco para que el Front pueda persistir sesión.
    El Backend no lo valida todavía, pero sí lo usa como contrato de auth.
    """
    return f"{rol}.{email}.{secrets.token_urlsafe(24)}"
