#Importamos de SQLAlchemy la funcion que nos permite crear la conexion con PostgreSQL
from sqlalchemy import create_engine
#Importamos de SQLAlchemy la funcion que nos permite crear las sesiones
#Tambien importamos la clase de la que van a heredar los modelos 
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os

#Asignamos la direccion de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://usuario:contrasena@localhost:5432/a_db")

#Creamos la conexion con la base de datos usando la URL
engine = create_engine(DATABASE_URL)
#Establecemos la configuracion para crear las sesiones para las consultas a la base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Definimos la clase base para que los modelos hereden de ella, indicamos que todo lo que 
#herede de esta clase representa una tabla
class Base(DeclarativeBase):
    pass

#Definimos la funcion que permite abrir la sesion
def get_db():
    db = SessionLocal()
    #Pasamos db al endpoint que la necesite 
    try:
        yield db
    finally:
        db.close()
