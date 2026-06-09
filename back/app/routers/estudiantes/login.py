# Importamos de FastAPI router, la exepcion HTTP y Depends
from fastapi import APIRouter, HTTPException, Depends

# Importamos el schema estudiante y modelo
from app.schemas.usuarios import estudiante_schema as es
from app.models.usuarios import estudiante_model as em

# Imprtamos la funcion de verificar el hash, obtener la Base de datos y crear el schema para la respuesta
from app.services.usuarios.auth_service import verificar_hash, generar_token
from app.services.usuarios.respuesta_usuario import crear_respuesta
from app.database import get_db

# Importamos de SQLAlchemy la funcion select
from sqlalchemy import select

# Imprtamos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session

from app.schemas.usuarios.usuario_schema import UsuarioLogin

# Instanciamos el router para este endpoit
router: APIRouter = APIRouter()


# Definimos el endpoint y su metodo HTTP
@router.post("/estudiantes/login", status_code=200)
async def logear_estudiante(
    informacion_estudiante: UsuarioLogin, db: Session = Depends(get_db)
):
    """
    Definimos la funcion del endpoint, que sera la encargada de validar el inicio de sesion:
    - Recibimos los datos del estudiante, iniciamos una sesion en la base de datos
    - para realizar una consulta y obtener el usuario y la contraseña para comparar que sean los mismos,
    - Retornamos el estado de esta operacion
    """
    try:
        # Definimos la query con los parametros de la consulta que queremos realizar
        query = select(em.Estudiante).where(
            em.Estudiante.email == informacion_estudiante.email
        )
        # Ejecutamos la consulta
        estudiante_db: em.Estudiante = db.execute(query).scalar_one_or_none()
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
            nombre=estudiante_db.nombre,
            apellido=estudiante_db.apellido,
            email=estudiante_db.email,
        )

        # Retornamos el schema de respuesta del usuario creado
        return {
            "token": generar_token("student", estudiante_db.email),
            "role": "student",
            "user": estudiante_logeado.model_dump(),
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(status_code=400, detail="Fallo en el inicio de sesion")
