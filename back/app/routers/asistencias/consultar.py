# Importamos de FastAPI el router, la excepcion HTTP y Depends
from fastapi import APIRouter, HTTPException, Depends

# Importmaos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session

# Importamos de SQLAlchemy la funcion select
from sqlalchemy import select

# Importamos de database la funcion get_db
from app.database import get_db

# Importamos el modelo de la clase
from app.models.clases.clase_model import Clase

# Instanciamos el router de la aplicacion
router: APIRouter = APIRouter()


# Definimos el endpoint con el metodo HTTP y la funcion
@router.get("/asistencia/consulta", status_code=200)
async def consultar_registro(id_clase: int, db: Session = Depends(get_db)):
    """
    Esta funcion se encarga de consultar los estudiantes que registraron asistencia en una clase:
    - Preparamos la consulta a la clase que se solicita
    - Ejecutamos la consulta e instanciamos un objeto Clase
    - Obtenemos de esa clase la lista de los estudiantes
    - Retornamos los estudiantes
    """
    try:
        # Definimos la consulta que vamos a hacer a la Base de Datos
        query = select(Clase).where(Clase.id == id_clase)
        # Ejecutamos la consulta
        clase: Clase = db.execute(query).scalar_one_or_none()
        # Verificamos que haya encontrado esa clase
        if clase is None:
            raise HTTPException(
                status_code=404, detail="No se encontro la clase que esta consultando"
            )
        # Retornamos la lista de los estudiantes
        return {"asistencia_estudiantes": clase.estudiantes}
    # Capturamos cualquier excepcion que pueda presentarse
    except Exception:
        raise HTTPException(
            status_code=404, detail="Ha ocurrido un error, intentelo de nuevo"
        )
