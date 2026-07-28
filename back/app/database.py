# Importamos de SQLAlchemy la funcion que nos permite crear la conexion con PostgreSQL
from sqlalchemy import create_engine

# Importamos de SQLAlchemy la funcion que nos permite crear las sesiones
# Tambien importamos la clase de la que van a heredar los modelos
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Importamos la configuracion centralizada, que ya cargo el .env y valido las variables
from app.config import DATABASE_URL

# Creamos la conexion con la base de datos usando la URL.
# Los parametros del pool importan cuando la base de datos es remota (Supabase):
# - pool_pre_ping: antes de usar una conexion del pool comprueba que siga viva.
#   Sin esto, la primera consulta despues de un rato inactivo falla con
#   "server closed the connection unexpectedly", porque el pooler ya la cerro.
# - pool_recycle: descarta conexiones con mas de 5 minutos, antes de que las
#   cierre el otro extremo.
# - pool_size / max_overflow: el plan gratuito tiene un limite bajo de conexiones
#   concurrentes, asi que mantenemos el pool pequeno.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=2,
)
# Establecemos la configuracion para crear las sesiones para las consultas a la base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Definimos la clase base para que los modelos hereden de ella, indicamos que todo lo que
# herede de esta clase representa una tabla
class Base(DeclarativeBase):
    pass


# Definimos la funcion que permite abrir la sesion
def get_db():
    db = SessionLocal()
    # Pasamos db al endpoint que la necesite
    try:
        yield db
    finally:
        db.close()
