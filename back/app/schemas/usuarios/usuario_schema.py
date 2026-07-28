# Importamos de Pydantic Base Model para validar los datos que recibimos del Front-End
from pydantic import BaseModel

# Importamos Field para poner limites a los campos
from pydantic import Field

# Importamos de Pydantic EmailStr para validar si el correo ingresado es valido
from pydantic import EmailStr


# Clase para guardar los datos del estudiante
class UsuarioCreado(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    apellido: str = Field(min_length=1, max_length=100)
    email: EmailStr
    # El minimo evita cuentas con contrasenas triviales.
    # El maximo es un limite de bcrypt: solo tiene en cuenta los primeros
    # 72 bytes, asi que rechazamos de entrada lo que no podria verificarse.
    contrasena: str = Field(min_length=8, max_length=72)


# Clase para el login del usuario
class UsuarioLogin(BaseModel):
    email: EmailStr
    # En el login no exigimos longitud minima: quien ya tiene una cuenta creada
    # antes de esta validacion debe poder seguir entrando. El maximo se mantiene
    # porque bcrypt no puede procesar mas de 72 bytes.
    contrasena: str = Field(max_length=72)

