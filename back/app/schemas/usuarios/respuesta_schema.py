# Importamos Pydantic para la validacion de los datos del schema
from pydantic import BaseModel

# Importamos EmailStr para la validacion del email
from pydantic import EmailStr


class RespuestaUsuario(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
