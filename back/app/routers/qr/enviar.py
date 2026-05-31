# Importamos de FastAPI el router de la aplicacion, la excepcion HTTP y Depends
from fastapi import APIRouter, HTTPException, Depends

# Importamos las sesiones de SQLAlchemy para hacer las consultas a la Base de Datos
from sqlalchemy.orm import Session

#Importamos select para poder crear la consulta
from sqlalchemy import select

# Importamos de database la funcion get_db
from app.database import get_db

#Importamos el modelo ORM de la clase
from app.models.clases.clase_model import Clase

# Creamos la instancia del router
router: APIRouter = APIRouter()


# Definimos la ruta de la funcion del endpoint
@router.get("/qr")
async def enviar_qr(id_clase: int, db: Session = Depends(get_db)):
    """
    Esta funcion se encarga de enviar al Front-End el codigo QR para que sea usado para el registro:
    - Consultamos mediante el id de la clase en las clases que existen en la Base de Datos
    - Creamos la instancia del ORM de la Clase
    - Retornamos el valor de la imagen del codigo QR
    """
    try:
        #Estructuramos la consulta a la Base de Datos en busca de la clase con el ID que recibimos
        query = select(Clase).where(Clase.id == id_clase)
        #Ejecutamos la consulta
        clase = db.execute(query).scalar_one_or_none()
        #Verificamos que hayamos encontrado la clase que consultamos
        if clase is None:
            raise HTTPException(status_code=404, detail="La clase no esta registrada")
        #Obtenemos la imagen del QR de la clase
        qr = clase.qr
        #Retornamos la imagen del QR 
        return {"imagen_qr": qr}
    except Exception:
        raise HTTPException(status_code=400, detail="Ha ocurrido un error, intentelo de nuevo")