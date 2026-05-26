# Importamos pydantic para validar los datos del front
from pydantic import BaseModel

# Importamos de typing la clase List
from typing import List

# Importamos el esquema base de validacion con Pydantic del usuario
from app.schemas.usuarios import usuario_schema as us

# Importamos el esquema de la clase para la lista de las clases del docente
from app.schemas.clases.clase_schema import ClaseCreada

class DocenteCreado(us.UsuarioCreado):
    clases: List[ClaseCreada]
