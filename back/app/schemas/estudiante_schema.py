#Importamos de Pydantic Base Model para validar los datos que recibimos del Front-End
from pydantic import BaseModel
#Importamos de Pydantic EmailStr para validar si el correo ingresado es valido
from pydantic import EmailStr

#Clase para guardar los datos del estudiante
class EstudianteCreado(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    contrasena: str

