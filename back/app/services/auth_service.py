#Importamos de bcrypt la funcion para:
#Generar el hash, revisar el hash y generar el salt
from bcrypt import hashpw, checkpw, gensalt


#Funcion para el hash
def generar_hash(contrasena: str) -> bytes:
    '''
    Recibimos la contraseña como parametro de la funcion
    Generamos el salt para generar el hash de la contraseña
    Generamos el hash para la contraseña y lo retornamos
    '''
    salt = gensalt()
    hash = hashpw(contrasena.encode("utf-8"), salt)
    return hash


#Funcion para verificar la contraseña
def verificar_hash(contrasena: str, hash_guardado: bytes) -> bool:
    '''
    Revisamos si el hash es igual al que tenemos guardado
    Retornamos un valor booleano en base a lo anterior
    '''
    #Compraramos los hashes
    comparacion_hashes = checkpw(contrasena.encode("utf-8"), hash_guardado)
    return comparacion_hashes   