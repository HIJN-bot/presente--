#Importmaos de pydantic BaseModel para la validacion de datos
from pydantic import BaseModel
#Importamos de typing optional para algunos atributos
from typing import Optional

class QrCreado(BaseModel):
    #URL del QR
    url: str
    #Imagen del QR en base64 con el dibujo
    qr_image: Optional[str]
    #El ID de la clase a la que le pertenece
    clase_id: Optional[int]
    #Fecha/hora de expiracion
    expiracion: Optional[str] = None