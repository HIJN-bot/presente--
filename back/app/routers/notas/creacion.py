# Importamos de FastAPI el router, HTTPException y Depends
from fastapi import APIRouter, HTTPException, Depends

# Importamos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session

# Importamos de SQLAlchemy select para las consultas
from sqlalchemy import select

# Importamos pydantic para la validacion del email con EmailStr
from pydantic import EmailStr

# Importamos el schema de la nota
from app.schemas.notas.nota_schema import NotaCreada

# Importamos el modelo del estudiante
from app.models.usuarios.estudiante_model import Estudiante

# Importamos el modelo de la nota
from app.models.notas.nota_model import Nota

# Importamos get_db para crear las sesiones con la Base de datos
from app.database import get_db

# Importamos las dependencias de autenticacion (usuario del token y verificacion de dueño)
from app.services.usuarios.usuario_actual import UsuarioActual, requerir_estudiante, verificar_propietario

# Instanciamos el router
router: APIRouter = APIRouter()


# Definimos el endpoint, el metodo HTTP y el status code de retorno
@router.post("/notas/creacion", status_code=201)
async def crear_nota(
    informacion_nota: NotaCreada,
    email_estudiante: EmailStr,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(requerir_estudiante),
):
    """
    Esta funcion se encarga de guardar una nota personal del estudiante:
    - Consultamos el estudiante mediante su email
    - Creamos el modelo de la nota asociado a ese estudiante
    - Guardamos la nota en la base de datos
    - Retornamos la nota creada
    """
    try:
        # Verificamos que el estudiante de la peticion sea el usuario del token
        verificar_propietario(email_estudiante, usuario)
        # Creamos la consulta para obtener el estudiante de la base de datos
        query = select(Estudiante).where(Estudiante.email == email_estudiante)
        # Ejecutamos la consulta
        estudiante_db = db.execute(query).scalar_one_or_none()
        # Verificamos que hayamos encontrado ese estudiante
        if estudiante_db is None:
            raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        # Creamos el modelo de la nota
        nota = Nota(contenido=informacion_nota.contenido, estudiante_id=estudiante_db.id)
        # Añadimos la nota a los cambios para la base de datos
        db.add(nota)
        # Comprometemos los cambios en la base de datos
        db.commit()
        # Refrescamos para obtener el id y la fecha que asigno la base de datos
        db.refresh(nota)
        # Retornamos la nota en el mismo formato que la consulta
        return {"id": nota.id, "contenido": nota.contenido, "fecha": nota.fecha}
    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error al intentar guardar la nota")
