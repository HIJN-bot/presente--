# Importamos de FastAPI router, la exepcion HTTP y Depends
from fastapi import APIRouter, HTTPException, Depends

# Importamos el schema estudiante y modelo
from app.schemas import estudiante_schema as es
from app.models import estudiante_model as em

# Imprtamos la funcion de verificar el hash, obtener la Base de datos y crear el schema para la respuesta
from app.services.auth_service import verificar_hash
from app.services.respuesta_usuario import crear_respuesta
from app.database import get_db

# Importamos de SQLAlchemy la funcion select
from sqlalchemy import select

# Imprtamos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session

# Instanciamos el router para este endpoit
router: APIRouter = APIRouter()


# Definimos el endpoint y su metodo HTTP
@router.post("/estudiantes/login", status_code=200)


# Definimos la funcion del endpoint, que sera la encargada de validar el inicio de sesion
# Recibimos para ello un objeto estudiante
async def logear_estudiante(
    informacion_estudiante: es.EstudianteCreado, db: Session = Depends(get_db)
):
    """
    Recibimos los datos del estudiante, iniciamos una sesion en la base de datos
    para realizar una consulta y obtener el usuario y la contraseña para comparar que sean los mismos,
    Retornamos el estado de esta operacion
    """
    try:
        # Abrimos la sesion de la base de datos
        with Session(db) as session:
            # Definimos la query con los parametros de la consulta que queremos realizar
            query = select(em.Estudiante).where(
                em.Estudiante.email == informacion_estudiante.email
            )
            # Ejecutamos la consulta
            estudiante_db: em.Estudiante = session.execute(query).scalar_one_or_none()
            # Verificamos que el email ingresado este en la base de datos
        if estudiante_db is None:
            raise HTTPException(
                status_code=404,
                detail="No se encontro el usuario para el que intentas iniciar sesion",
            )
        # Verificamos que la contraseña sea correcta
        if not verificar_hash(
            informacion_estudiante.contrasena, estudiante_db.hash_contrasena
        ):
            raise HTTPException(status_code=404, detail="Contraseña incorrecta")

        # Creamos el schema de repuesta
        estudiante_logeado = crear_respuesta(
            nombre=informacion_estudiante.nombre,
            apellido=informacion_estudiante.apellido,
            email=informacion_estudiante.email,
        )

        # Retornamos el schema de respuesta del usuario creado
        return estudiante_logeado

    except Exception:
        raise HTTPException(status_code=400, detail="Fallo en el inicio de sesion")
