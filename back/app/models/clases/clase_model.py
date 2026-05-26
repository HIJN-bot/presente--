# Importamos Base de SQLAlchemy para crear el ORM y relationship para la coleccion de estudiantes registrados en la clase
from sqlalchemy.orm import relationship

# Importamos de SQLALchemy las columnas, y los tipos de datos necesarios para crear la tabla
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey

#Importamos el modelo Base de database
from app.database import Base


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
    docente = relationship("Docente", back_populates="clase")
    # Coleccion de estudiantes, referenciamos al modelo del estudiante
    estudiantes = relationship("Estudiante", back_populates="clase")
    # QR de la clase
    qr = Column(Text, nullable=False)
