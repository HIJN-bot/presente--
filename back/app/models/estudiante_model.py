#Importamos de SQLAlchemy los tipos de columnas para poder definir las columnas de nuestra tabla SQL
#(Atributos)
from sqlalchemy import Column, String
#Importamos de SQLAlchrmy Base, para poder trabajar la clase como tabla
from app.database import Base  

#Definimos la clase como esqueleto de la tabla 
class Estudiante(Base):
    __tablename__ = "estudiantes"
    #id: Determinado por una funcion
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    #Hacemoes que el email sea unico, tenga un indice determinado y obligarorio
    email = Column(String, unique=True, index=True, nullable=False)
    hash_contrasena = Column(String, nullable=False)


