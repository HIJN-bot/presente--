#De fastapi importamos el Router de la API
from fastapi import APIRouter
#Importamos el archivo del esquema de estudiantes
from schemas import estudiante_schema as es

#Instanciamos el Router para crear la API
router: APIRouter = APIRouter()

#Definimos el metodo HTTP para nuestra API
@router.post("/estudiantes")
async def registrar_estudiante(informacion_estudiante: es.EstudianteCreado):
    pass
