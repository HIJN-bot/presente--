#Importamos de pydantic BaseModel para la validacion y EmailStr para el typehint
from pydantic import BaseModel, EmailStr

class InputAsistencia(BaseModel):
    id_clase: int
    email_estudiante: EmailStr