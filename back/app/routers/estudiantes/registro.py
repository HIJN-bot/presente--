#De fastapi importamos el Router de la API
from fastapi import APIRouter

#Instanciamos el Router para crear la API
router: APIRouter = APIRouter()

#Definimos el metodo HTTP para nuestra API
@router.post("/estudiantes")
async def registrar_estudiante(informacion_estudiante: dict):
    pass
