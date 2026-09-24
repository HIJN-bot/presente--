# Importamos de SQLAlchemy relationship y backref para relacionar la nota con su estudiante
from sqlalchemy.orm import relationship, backref

# Importamos de SQLAlchemy las columnas y los tipos de datos necesarios para crear la tabla
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func

# Importamos el modelo Base de database
from app.database import Base


# Creamos la clase que representa la tabla de las notas personales del estudiante.
# Cada nota es privada: solo se consulta con el email de su autor.
class Nota(Base):
    # Nombre de la tabla
    __tablename__ = "notas"
    id = Column(Integer, primary_key=True)
    # Texto de la nota
    contenido = Column(Text, nullable=False)
    # Fecha de publicacion, la asigna la base de datos al insertar.
    # Con zona horaria para que el Front-End la muestre en la hora local del usuario
    fecha = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    # Id del estudiante que escribio la nota; si se borra el estudiante se borran sus notas
    estudiante_id = Column(
        Integer, ForeignKey("estudiantes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Estudiante autor de la nota. passive_deletes deja que la base de datos borre
    # las notas (ON DELETE CASCADE) en lugar de intentar dejar estudiante_id en NULL
    estudiante = relationship("Estudiante", backref=backref("notas", passive_deletes=True))
