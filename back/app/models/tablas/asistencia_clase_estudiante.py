# Importamos Column y ForeignKey para definir la tabla puente de asistencia
from sqlalchemy import Column, ForeignKey, Integer, Table

# Importamos Base para registrar la tabla en el metadata general de SQLAlchemy
from app.database import Base


# Tabla puente que relaciona clases con estudiantes que registraron asistencia
asistencia_clase_estudiante = Table(
    "asistencia_clase_estudiante",
    Base.metadata,
    Column("clase_id", ForeignKey("clase.id"), primary_key=True),
    Column("estudiante_id", ForeignKey("estudiantes.id"), primary_key=True),
)