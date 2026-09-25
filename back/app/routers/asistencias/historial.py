# Importamos de FastAPI el router, la excepcion HTTP y Depends
from fastapi import APIRouter, HTTPException, Depends

# Importamos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session

# Importamos de SQLAlchemy la funcion select
from sqlalchemy import select

# Importamos pydantic para la validacion del email con EmailStr
from pydantic import EmailStr

# Importamos de database la funcion get_db
from app.database import get_db

# Importamos el modelo de la clase para que se registre la relacion Estudiante.clases
from app.models.clases.clase_model import Clase  # noqa: F401

# Importamos el modelo del estudiante
from app.models.usuarios.estudiante_model import Estudiante

# Instanciamos el router de la aplicacion
router: APIRouter = APIRouter()


# Definimos el endpoint con el metodo HTTP y la funcion
@router.get("/asistencia/historial", status_code=200)
async def consultar_historial(email_estudiante: EmailStr, db: Session = Depends(get_db)):
    """
    Esta funcion se encarga de consultar las clases en las que un estudiante registro asistencia:
    - Consultamos el estudiante mediante su email
    - Obtenemos sus clases a traves de la tabla de asistencia
    - Retornamos las clases, de la mas reciente a la mas antigua
    """
    try:
        # Definimos la consulta del estudiante
        query = select(Estudiante).where(Estudiante.email == email_estudiante)
        # Ejecutamos la consulta
        estudiante: Estudiante = db.execute(query).scalar_one_or_none()
        # Verificamos que se haya encontrado el estudiante
        if estudiante is None:
            raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        # Ordenamos las clases por horario, las mas recientes primero
        clases = sorted(estudiante.clases, key=lambda clase: clase.horario, reverse=True)
        # Retornamos las clases en un formato serializable
        return [
            {
                "id": clase.id,
                "materia": clase.materia,
                "horario": clase.horario,
                "docente": (
                    f"{clase.docente.nombre} {clase.docente.apellido}".strip()
                    if clase.docente
                    else None
                ),
            }
            for clase in clases
        ]
    # Capturamos cualquier excepcion que pueda presentarse
    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400, detail="Error al intentar consultar el historial de asistencia"
        )
