# Importamos de FastAPI el router y la excepcion HTTP
from fastapi import APIRouter, HTTPException, Depends

# Imoprtamos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session

# Importamos de SQLAlchemy la funcion select para las consultas
from sqlalchemy import select

# Importamos la funcion get_db para la base de datos
from app.database import get_db

# Importamos el modelo de la clase
from app.models.clases.clase_model import Clase

# Instanciamos el router
router = APIRouter()


# Definimos el endpoint
@router.delete("/clases/eliminar", status_code=200)
async def eliminar_clase(clase_id: int, db: Session = Depends(get_db)):
    """
    La funcion eliminar_clase se encarga de borrar el registro de una clase en la base de datos:
    - Recibe el id de la clase
    - La elimina de la tabla "clase"
    - Elimina su relacion con la tabla de asistencia
    """
    # Definimos la query
    query = select(Clase).where(Clase.id == clase_id)
    # Ejecutamos la query
    clase_db = db.execute(query).scalar_one_or_none()
    # Verificamos si la clase que consultamos exista en la base de datos
    if clase_db is None:    
        raise HTTPException(
            status_code=404, detail="La clase que intenta borrar no existe"
        )
    # Eliminamos la clase de la base de datos
    db.delete(clase_db)
    # Comprometemos los cambios
    db.commit()
    # Retornamos el detalle de la ejecucion
    return {"detail": "Clase eliminada correctamente"}
