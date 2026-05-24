# Importamos pydantic para validar los datos del front
from pydantic import BaseModel

# Importamos el esquema base de validacion con Pydantic del usuario
from app.schemas import usuario_schema as us


class DocenteCreado(BaseModel, us):
    pass
