# Importamos BaseModel y StringConstraints desde Pydantic para la validacion de datos
from pydantic import BaseModel, StringConstraints

# Importamos Annotated para agregar las restricciones al tipo str
from typing import Annotated


class NotaCreada(BaseModel):
    # Texto de la nota: se quitan los espacios de los extremos y no puede quedar vacio.
    # El limite coincide con el maxLength del formulario del Front-End.
    contenido: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)
    ]
