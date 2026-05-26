# Importamos de FastAPI el router, HTTPException y Depends
from fastapi import APIRouter, HTTPException, Depends

# Imoprtamos de SQLAlchemy las sesiones
from sqlalchemy.orm import Session

# Importamos el ManagerClase
from app.services.clases.manager_clases import ManagerClases

# Importamos el schema de estudiante
from app.schemas.usuarios.estudiante_schema import EstudianteCreado

# Imprtamos el schema de las clases
from app.schemas.clases.clase_schema import ClaseCreada

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
async def crear_clase(informacion_clase: ClaseCreada, db: Session = Depends(get_db)):
    """
    Esta funcion del endpoint se encarga de crear una clase y registrarla en la base de datos:
    - Instanciamos el ManagerClase
    - Creamos el schema de la clase
    - Creamos el modelo de la clase
    - Añadimos a la base de datos el modelo de la clase
    - Comprometemos a la base de datos
    - Retornamos la instancia de clase que acabamos de crear
    """
    try:
        # Instanciamos el ManagerClase
        manager_clase: ManagerClases = ManagerClases()
        # Creamos el schema de la clase
        datos_clase: ClaseCreada = manager_clase.crear_clase(
            informacion_clase.materia,
            informacion_clase.horario,
            informacion_clase.docente,
            informacion_clase.qr,
        )
        # Creamos el modelo de la clase solo con los campos directos, no relaciones ni listas de schemas
        clase = Clase(
            materia=datos_clase.materia,
            horario=datos_clase.horario,
            docente_id=getattr(datos_clase, 'docente_id', None),  # Usamos getattr por si el campo no existe
            qr=datos_clase.qr.qr_image if hasattr(datos_clase.qr, 'qr_image') else datos_clase.qr
        )
        # Añadimos la clase a los cambios para la base de datos
        db.add(clase)
        # Comprometemos los cambios en la base de datos
        db.commit()
        # Refrescamos despues del commit
        db.refresh(clase)
        # Retornamos la instancia de la clase creada (puedes retornar el modelo o un schema de respuesta)
        return clase
    except Exception:
        raise HTTPException(status_code=400, detail="Error al intentar crear la clase")

