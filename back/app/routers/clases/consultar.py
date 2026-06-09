# Importamos de FastAPI el router, HTTPException y Depends
from fastapi import APIRouter, HTTPException, Depends

# Imoprtamos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session

# Importamos de SQLAlchemy select para las consultas
from sqlalchemy import select

#Importamos pydantic para la validacion del email con EmailStr
from pydantic import EmailStr

# Importamos el modelo del docente
from app.models.usuarios.docente_model import Docente

# Importamos get_db para crear las sesiones con la Base de datos
from app.database import get_db

# Instanciamos el router del endpoint
router: APIRouter = APIRouter()


# Declaramos el decorador de la funcion del endpoint con su status code
@router.get("/clases/consultar", status_code=200)
async def consultar_clase(
    email_docente: EmailStr, db: Session = Depends(get_db)
):
    """
    Esta funcion se encarga de consultar las clases que tiene un docente:
    - Creamos la estructura de la consulta
    - Ejecutamos la consulta a la base de datos
    - Obtenemos el docente de la base de datos
    - Obtenemos la lista de las clases que tiene
    - Creamos el schema de las claes
    - Retornamos la lista de las clases
    """
    try:
        # Creamos la estructura de la consulta
        query = select(Docente).where(Docente.email == email_docente)
        # Ejecutamos la consulta
        docente_db = db.execute(query).scalar_one_or_none()
        # Verificamos que hayamos encontrado ese docente
        if docente_db is None:
            raise HTTPException(status_code=404, detail="Docente no encontrado")
        # Retornamos las clases en un formato serializable y útil para el Front
        clases = []
        for clase in docente_db.clases:
            clases.append(
                {
                    "id": clase.id,
                    "materia": clase.materia,
                    "horario": clase.horario,
                    "qr": clase.qr,
                    "docente": f"{docente_db.nombre} {docente_db.apellido}".strip(),
                    "student_count": len(clase.estudiantes or []),
                }
            )
        return clases
    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400, detail="Error al intentar consultar las clases"
        )
