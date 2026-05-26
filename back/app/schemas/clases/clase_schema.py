#Importamos BaseModel desde Pydantic para la validacion de datos
from pydantic import BaseModel
#Importamos de typing List para ser mas explicito con el tipo de la lista
from typing import List
#Importamos la clase datetime desde datetime para el atributo horario
from datetime import datetime
#Importamos el qr correspondiente a la clase 
from app.schemas.clases.qr_clase_schema import QrCreado
#Importamos el schema de estudiante
from app.schemas.usuarios.estudiante_schema import EstudianteCreado



class ClaseCreada(BaseModel):
    #Nombre de la materia
    materia: str 
    #Horario asignado a la clase
    horario: datetime
    #ID del docente que dara la clase
    docente_id: int
    #Nombre del docente que dara la clase
    docente: str
    #Coleccion de estudiantes registrados en la asistencia de la clase
    estudiantes: List[EstudianteCreado]
    #Qr de la clase
    qr: QrCreado