# Importamos Base de SQLAlchemy para crear el ORM y relationship para la coleccion de estudiantes registrados en la clase
from sqlalchemy.orm import relationship

# Importamos de SQLALchemy las columnas, y los tipos de datos necesarios para crear la tabla
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey

#Importamos el modelo Base de database
from app.database import Base

# Importamos la tabla puente de asistencia desde su modulo propio
from app.models.tablas.asistencia_clase_estudiante import asistencia_clase_estudiante


# Creamos la clase que representa la tabla de las clases que podra generar el docente
class Clase(Base):
    # Nombre de la tabla
    __tablename__ = "clase"
    id = Column(Integer, primary_key=True)
    # Nombre de la materia
    materia = Column(String, nullable=False)
    # Horario de la clase
    horario = Column(DateTime, nullable=False)
    # Id del docente que creo la clase
    docente_id = Column(Integer, ForeignKey("docentes.id"))
    # Nombre del docente
    docente = relationship("Docente", back_populates="clases")
    # Coleccion de estudiantes, referenciamos al modelo del estudiante
    estudiantes = relationship(
        "Estudiante",
        secondary=asistencia_clase_estudiante,
        backref="clases",
        cascade="all, delete",
        passive_deletes=True,
    )
    # QR de la clase
    qr = Column(Text, nullable=True)
