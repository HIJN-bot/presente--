# Importamos de FastAPI el router, HTTPException y Depends
from fastapi import APIRouter, HTTPException, Depends

# Imoprtamos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session
from pydantic import EmailStr

# Importamos de SQLAlchemy select para las consultas
from sqlalchemy import select

# Importamos el ManagerClase
from app.services.clases.manager_clases import ManagerClases

# Importamos el QrManager
from app.services.qr.manager_qr import ManagerQr

# Importamos el schema de estudiante
from app.schemas.usuarios.estudiante_schema import EstudianteCreado

# Imprtamos el schema de las clases
from app.schemas.clases.clase_schema import ClaseCreada

# Importamos el schema del docente
from app.schemas.usuarios.docente_schema import DocenteCreado

# Importamos el schema del QR
from app.schemas.clases.qr_clase_schema import QrCreado

# Importamos el modelo de docente
from app.models.usuarios.docente_model import Docente

# Importamos el modelo de la clase
from app.models.clases.clase_model import Clase

# Importamos get_db para crear las sesiones con la Base de datos
from app.database import get_db

# Instanciaos el router
router: APIRouter = APIRouter()


# Definimos el endpoint, el metodo HTTP y el status code de retorno
@router.post("/clases/creacion", status_code=201)
async def crear_clase(
    informacion_clase: ClaseCreada,
    email_docente: EmailStr,
    db: Session = Depends(get_db),
):
    """
    Esta funcion del endpoint se encarga de crear una clase y registrarla en la base de datos:
    - Instanciamos el ManagerClase
    - Creamos el schema de la clase
    - Creamos el modelo de la clase
    - Consultamos con la informacion del docente
    - Añadimos la clase en las clases que tiene el docente de la base de datos
    - Añadimos a la base de datos el modelo de la clase
    - Comprometemos a la base de datos
    - Retornamos la instancia de clase que acabamos de crear
    """
    try:
        # Instanciamos el ManagerQr
        manager_qr: ManagerQr = ManagerQr()
        # Creamos la consulta para obtener el docente de la base de datos
        query = select(Docente).where(Docente.email == email_docente)
        # Iniciamos la consulta
        docente_db: Docente = db.execute(query).scalar_one_or_none()
        # Revisamos si se encontro el docente
        if docente_db is None:
            raise HTTPException(status_code=404, detail="Docente no encontrado")
        # Creamos el schema de la clase
        datos_clase: ClaseCreada = ClaseCreada(
            materia=informacion_clase.materia,
            horario=informacion_clase.horario,
        )
        # Creamos el modelo de la clase solo con los campos directos, no relaciones ni listas de schemas
        clase = Clase(
            materia=datos_clase.materia,
            horario=datos_clase.horario,
            docente_id=docente_db.id,
        )
        # Añadimos al docente de la base de datos la clase que acabamos de crear
        docente_db.clases.append(clase)
        # Añadimos la clase a los cambios para la base de datos
        db.add(clase)
        # Añadimos el docente a los cambios para la base de datos
        db.add(docente_db)
        # Comprometemos los cambios en la base de datos
        db.commit()
        # Refrescamos despues del commit
        db.refresh(clase)
        # Refrescamos despues del commit
        db.refresh(docente_db)
        # Creamos el QR para asignarlo a su clase
        qr = manager_qr.crear_qr(
            clase_id=clase.id,
            endpoint=f"/asistencia?clase_id={clase.id}",
        )
        # Asignamos el QR a la clase
        clase.qr = qr.qr_image
        # Añadimos la clase nuevamente a los cambios para la base de datos
        db.add(clase)
        # Comprometemos los cambios de la clase ahora con el QR
        db.commit()
        # Refrescamos despues del commit
        db.refresh(clase)
        # Creamos el schema de respuesta para el enviarlo al Front-End
        # Retornamos un payload serializable y fácil de consumir desde el Front
        return {
            "id": clase.id,
            "materia": clase.materia,
            "horario": clase.horario,
            "docente_id": clase.docente_id,
            "docente_email": docente_db.email,
            "qr": clase.qr,
        }
    except HTTPException:
        raise

    except Exception:
        raise HTTPException(status_code=400, detail="Error al intentar crear la clase")
