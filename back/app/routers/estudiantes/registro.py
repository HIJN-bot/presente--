# De fastapi importamos el Router de la API, la funcion para inyectar dependencias y la excepcion
from fastapi import APIRouter, Depends, HTTPException

# Importamos el archivo del schema de estudiantes
from app.schemas.usuarios import estudiante_schema as es

# Importamos el archivo del schema de la respuesta del usuario
from app.schemas.usuarios import respuesta_schema as rs

# Importamos de SQLAlchemy las sesiones para poder usarlas e interactuar con la Base de Datos
from sqlalchemy.orm import Session

# Importamos de database.py la funcion get_db para poder crear las sesiones
from app.database import get_db

# Importamos el modelo ORM
from app.models.usuarios import estudiante_model as em

# Importamos servicios necesarios
from app.services.usuarios.crear_hash import hashear_contrasena
from app.services.usuarios.auth_service import generar_token
from app.services.usuarios.crear_usuario import crear_usuario
from app.services.usuarios.validar_email import validar_email
from app.services.usuarios.respuesta_usuario import crear_respuesta

# Instanciamos el Router para crear la API
router: APIRouter = APIRouter()


# Definimos el metodo HTTP para nuestra API
@router.post("/estudiantes/registro", status_code=201)
async def registrar_estudiante(
    informacion_estudiante: es.EstudianteCreado, db: Session = Depends(get_db)
):
    """
    Definimos la funcion del Endpoint para registrar estudiantes: 
    - Recibimos los datos del estudiante, hasheamos la contraseña,
    - creamos la instancia del ORM y la guardamos en la Base de Datos
    """
    try:
        # Hasheamos la contraseña y modificamos el atributo
        estudiante_con_hash = hashear_contrasena(informacion_estudiante)
        # Convertimos el schema a diccionario
        datos_estudiante = crear_usuario(estudiante_con_hash)

        # Cambiamos 'contrasena' a 'hash_contrasena' para que coincida con la BD
        datos_estudiante["hash_contrasena"] = datos_estudiante.pop("contrasena")
        # Instanciar el modelo ORM Estudiante con los datos
        estudiante = em.Estudiante(**datos_estudiante)
        # Verificamos que el email propuesto no este registrado
        if not validar_email(estudiante.email, em.Estudiante, db):
            raise HTTPException(
                status_code=409, detail="Ese correo electronico ya esta registrado"
            )

        # Agregar a la sesión, guardar y refrescar
        db.add(estudiante)
        db.commit()
        db.refresh(estudiante)

        # Creamos el schema de respuesta
        respuesta_usuario: rs.RespuestaUsuario = crear_respuesta(
            nombre=estudiante.nombre,
            apellido=estudiante.apellido,
            email=estudiante.email,
        )
        # Retornar el estudiante creado y un token opaco para la sesión del Front
        return {
            "token": generar_token("student", estudiante.email),
            "role": "student",
            "user": respuesta_usuario.model_dump(),
        }

    except ValueError as e:
        # Si hay error de validación
        raise HTTPException(status_code=400, detail=f"Datos inválidos: {str(e)}")
    except HTTPException:
        raise

    except Exception as e:
        # Si hay error en la base de datos (ej: email duplicado)
        raise HTTPException(
            status_code=400, detail="No se pudo registrar al estudiante"
        )
