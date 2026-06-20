# Importamos de FastAPI el router, la excepcion HTTP y Depends
from fastapi import APIRouter, HTTPException, Depends

# Importamos de SQLAlchemy las sesiones para las consultas con la Base de Datos
from sqlalchemy.orm import Session

# Importamos de SQLAlchemy la funcion select para crear las consultas
from sqlalchemy import select

# Importamos de database la funcion get_db
from app.database import get_db

# Importamos de pydantic EmailStr para typehints
from pydantic import EmailStr

# Importmos el modelo de la clase
from app.models.clases.clase_model import Clase

# Importamos el modelo del estudiante
from app.models.usuarios.estudiante_model import Estudiante

#Importamos el schema del Input de la asistencia
from app.schemas.asistencia.asistencia_schema import InputAsistencia

# Instanciamos el router de la aplicacion
router: APIRouter = APIRouter()


# Declaramos el metodo HTTP y la funcion del endpoint
@router.post("/asistencia/registro", status_code=201)
async def registrar_asistencia(
    input_asistencia: InputAsistencia, db: Session = Depends(get_db)
):
    """
    Esta funcion se encarga de registrar la asistencia del estudiante en la clase:
    - Consultamos en la base de datos la clase mediante su id en la que se quiere registrar el usuario,
    - Consultamos el usuario mediante su email en la base de datos
    - Registramos el usuario en la base de datos
    - Retornamos con el codigo de estado
    """
    try:
        #Definimos el id de la clase 
        id_clase = input_asistencia.id_clase
        #Definimos el email del estudiante
        email_estudiante = input_asistencia.email_estudiante
        # Definimos la consulta de la clase
        query_clase = select(Clase).where(Clase.id == id_clase)
        # Definimos la consulta del estudiante
        query_estudiante = select(Estudiante).where(
            Estudiante.email == email_estudiante
        )
        # Ejecutamos la consulta de la clase
        clase: Clase = db.execute(query_clase).scalar_one_or_none()
        # Forzamos el refresh para cargar la relacion de estudiantes
        if clase:
            db.refresh(clase)
        # Verificamos que se haya encontrado la clase con ese id
        if clase is None:
            raise HTTPException(
                status_code=404,
                detail="La clase a la que se intenta registrar no ha sido encontrada",
            )
        # Ejecutamos la consulta del estudiante
        estudiante: Estudiante = db.execute(query_estudiante).scalar_one_or_none()
        # Verificamos que se haya encontrado el estudiante con ese email
        if estudiante is None:
            raise HTTPException(
                status_code=404,
                detail="El estudiante que esta intentando registrar la asistencia no se encuentra registrado",
            )
        # Revisamos que el estudiante no este ya registrado en la Clase
        if any(e.id == estudiante.id for e in clase.estudiantes):
            raise HTTPException(
                status_code=409,
                detail="El estudiante ya registro asistencia en esa clase",
            )
        # Añadimos el estudiante que se registro a la clase para registrar la asistencia
        clase.estudiantes.append(estudiante)
        # Comprometemos los cambios que hicimos al añnadir el estudiante a la clase
        db.commit()
        # Refrescamos la Base de Datos
        db.refresh(clase)
        # Retornamos el mensaje de exito
        return {"mensaje": "Asistencia registrada exitosamente"}
    # Manejamos la excepcion en caso que haya ocurrido un error
    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400, detail="Ha ocurrido un error, intentelo de nuevo"
        )
