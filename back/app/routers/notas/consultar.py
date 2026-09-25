# Importamos de FastAPI el router, HTTPException y Depends
from fastapi import APIRouter, HTTPException, Depends

# Importamos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session

# Importamos de SQLAlchemy select para las consultas
from sqlalchemy import select

# Importamos pydantic para la validacion del email con EmailStr
from pydantic import EmailStr

# Importamos el modelo del estudiante
from app.models.usuarios.estudiante_model import Estudiante

# Importamos el modelo de la nota
from app.models.notas.nota_model import Nota

# Importamos get_db para crear las sesiones con la Base de datos
from app.database import get_db

# Instanciamos el router del endpoint
router: APIRouter = APIRouter()


# Declaramos el decorador de la funcion del endpoint con su status code
@router.get("/notas/consultar", status_code=200)
async def consultar_notas(email_estudiante: EmailStr, db: Session = Depends(get_db)):
    """
    Esta funcion se encarga de consultar las notas personales de un estudiante:
    - Consultamos el estudiante mediante su email
    - Consultamos sus notas, de la mas reciente a la mas antigua
    - Retornamos la lista de notas
    """
    try:
        # Creamos la consulta para obtener el estudiante
        query_estudiante = select(Estudiante).where(Estudiante.email == email_estudiante)
        # Ejecutamos la consulta
        estudiante_db = db.execute(query_estudiante).scalar_one_or_none()
        # Verificamos que hayamos encontrado ese estudiante
        if estudiante_db is None:
            raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        # Creamos la consulta de las notas del estudiante, las mas recientes primero
        query_notas = (
            select(Nota)
            .where(Nota.estudiante_id == estudiante_db.id)
            .order_by(Nota.fecha.desc(), Nota.id.desc())
        )
        # Ejecutamos la consulta
        notas = db.execute(query_notas).scalars().all()
        # Retornamos las notas en un formato serializable
        return [
            {"id": nota.id, "contenido": nota.contenido, "fecha": nota.fecha}
            for nota in notas
        ]
    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400, detail="Error al intentar consultar las notas"
        )
