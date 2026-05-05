#Importamos de SQLAlchemy los tipos de columnas para poder definir las columnas de nuestra tabla SQL
#(Atributos)
from sqlalchemy import Column, String, Integer
#Importamos de SQLAlchrmy Base, para poder trabajar la clase como tabla
from app.database import Base  
#Importamos el modelo base de usuario
import usuario_model as um

#Definimos la clase como esqueleto de la tabla 
class Estudiante(Base, um.Usuario):
    __tablename__ = "estudiantes"
    id = Column(Integer, primary_key=True, index=True)

