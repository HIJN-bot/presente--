# Importamos SQLAlchemy para poder realizar el registro SQL
from sqlalchemy import Column, String, Integer

# Importamos la clase Base de SQLAlchemy que permite realizar los registros
from app.database import Base

# Importamos la clase Base del usuario
from app.models.usuarios import usuario_model as um


# Definimos la clase del modelo de docente como esqueleto de la tabla
class Docente(um.Usuario):
    __tablename__ = "docentes"
    id = Column(Integer, primary_key=True, index=True)
