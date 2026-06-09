# Importamos de FastAPI router, la exepcion HTTP y Depends
from fastapi import APIRouter, HTTPException, Depends

# Importamos el schema estudiante y modelo
from app.schemas.usuarios import docente_schema as ds
from app.models.usuarios import docente_model as dm

# Imprtamos la funcion de verificar el hash, obtener la Base de datos y crear el schema para la respuesta
from app.services.usuarios.auth_service import verificar_hash, generar_token
from app.services.usuarios.respuesta_usuario import crear_respuesta
from app.database import get_db

# Importamos de SQLAlchemy la funcion select
from sqlalchemy import select

# Imprtamos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session

from app.schemas.usuarios.usuario_schema import UsuarioLogin

# Instanciamos el router para crear el endpoint y la API
router: APIRouter = APIRouter()


# Definimos el router y su metodo HTTP
@router.post("/docentes/login", status_code=200)
async def logear_docente(
    informacion_docente: UsuarioLogin, db: Session = Depends(get_db)
):
    """
    Definimos la funcion del endpoint encargada del login del docente:
    - Recibimos la informacion del docente,
    - verificamos en la base de datos que exista un usuario con ese correo electronico
    - Revisamos que la constrasena coincida
    - Retornamos el estado de la operacion y los datos importantes del docente para el cliente
    """
    try:
            # Definimos la query con los parametros de la consulta que queremos realizar
            query = select(dm.Docente).where(
                dm.Docente.email == informacion_docente.email
            )
            # Ejecutamos la consulta
            docente_db: dm.Docente = db.execute(query).scalar_one_or_none()
            # Verificamos que el usuario con ese email registrado exista en la Base de Datos
            if docente_db is None:
                raise HTTPException(
                    status_code=404,
                    detail="No se encontro un usuario para esa direccion de correo electronico",
                )
            # Verificamos que la contraseña sea correcta
            if not verificar_hash(
                informacion_docente.contrasena, docente_db.hash_contrasena
            ):
                raise HTTPException(status_code=400, detail="Contraseña incorrecta")
            # Creamos el schema de respuesta
            docente_logeado = crear_respuesta(
                nombre=docente_db.nombre,
                apellido=docente_db.apellido,
                email=docente_db.email,
            )
            # Retornamos al cliente los datos necesarios del docente
            return {
                "token": generar_token("teacher", docente_db.email),
                "role": "teacher",
                "user": docente_logeado.model_dump(),
            }
    except HTTPException:
        raise

    except Exception:
        raise HTTPException(status_code=400, detail="Fallo en el inicio de sesion")
