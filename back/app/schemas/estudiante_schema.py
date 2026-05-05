#Importamos de Pydantic Base Model para validar los datos que recibimos del Front-End
from pydantic import BaseModel
#Importamos de Pydantic EmailStr para validar si el correo ingresado es valido
from pydantic import EmailStr
#Importamos el modelo Pydantic base Usuario
import usuario_schema as us

#Clase para guardar los datos del estudiante
class EstudianteCreado(BaseModel, us.UsuarioCreado):
    pass

