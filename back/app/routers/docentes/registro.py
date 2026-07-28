# Importamos de FastAPI el router, HTTPException y Depends
from fastapi import APIRouter, HTTPException, Depends

# Importamos logging para dejar el detalle de los errores en el servidor
import logging

# Logger de este modulo, usado cuando algo falla de forma inesperada
logger = logging.getLogger(__name__)

# Importamos el schema de docente
from app.schemas.usuarios import docente_schema as ds

# Importamos el schema de respuesta
from app.schemas.usuarios import respuesta_schema as rs

# Importamos el modelo de docente
from app.models.usuarios import docente_model as dm

# Importamos de SQLAlchemy las sesiones para la comunicacion con la Base de Datos
from sqlalchemy.orm import Session

# Importamos get_db para poder crear las sesiones
from app.database import get_db

# Importamos los servicios de autentificacion, crear hash, crear usuario, validar email y crear la respuesta
from app.services.usuarios.auth_service import generar_hash
from app.services.usuarios.auth_service import generar_token
from app.services.usuarios.crear_hash import hashear_contrasena
from app.services.usuarios.validar_email import validar_email
from app.services.usuarios.crear_usuario import crear_usuario
from app.services.usuarios.respuesta_usuario import crear_respuesta

# Instanciamos el router para crear el endpoint de la API
router: APIRouter = APIRouter()


# Creamos el endpoint de la API
@router.post("/docentes/registro", status_code=201)
async def registrar_docente(
    informacion_docente: ds.DocenteCreado, db: Session = Depends(get_db)
):
    """
    Definimos la funcion de registro para los docentes:
    - Recibimos los datos del docente, hasheamos la contraseña,
    - creamos el modelo del docente,
    - revisamos que el correo no este registrado en la Base de Datos,
    - comprometemos el docente y lo creamos en la Base de Datos,
    - retornamos la informacion necesaria del docente creado
    """

    try:
        # Hasheamos la contraseña del docente
        docente_con_hash = hashear_contrasena(informacion_docente)
        # Creamos un diccionario con los datos del docente
        datos_docente = crear_usuario(docente_con_hash)

        # Cambiamos el nombre del campo 'contrasena' a 'hash_contrasena'
        datos_docente["hash_contrasena"] = datos_docente.pop("contrasena")
        # Creamos el ORM del docente
        docente = dm.Docente(**datos_docente)
        # Validamos mediante el email que el docente no este registrado
        if not validar_email(docente.email, dm.Docente, db):
            raise HTTPException(
                status_code=409, detail="Este correo electronico ya esta registrado"
            )

        # Iniciamos la sesion en la base de datos para comprometer los cambios y registrar el docente
        db.add(docente)
        db.commit()
        db.refresh(docente)

        # Creamos el schema de la respuesta del usuario creado
        respuesta_usuario: rs.RespuestaUsuario = crear_respuesta(
            nombre=docente.nombre,
            apellido=docente.apellido,
            email=docente.email,
        )
        # Retornamos el docente creado y un token opaco para la sesión del Front
        return {
            "token": generar_token("teacher", docente.email),
            "role": "teacher",
            "user": respuesta_usuario.model_dump(),
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Los datos enviados no son validos")

    except HTTPException:
        raise

    except Exception:
        # Registramos el detalle completo en el log del servidor, pero al cliente
        # le devolvemos un mensaje generico: el texto de la excepcion puede
        # revelar nombres de tablas, columnas o la cadena de conexion.
        logger.exception("Error inesperado al registrar un docente")
        raise HTTPException(
            status_code=400, detail="No se pudo completar el registro"
        )
