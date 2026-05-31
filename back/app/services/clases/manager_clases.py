# Importamos el schema de las clases
from app.schemas.clases.clase_schema import ClaseCreada

# Importamos el schema de los QR
from app.schemas.clases.qr_clase_schema import QrCreado

# Importamos el schema de estudiante para el Typehint de la lista
from app.schemas.usuarios.estudiante_schema import EstudianteCreado

# Importamos el modelo de la clase
from app.models.clases.clase_model import Clase

# Importamos el modelo del estudiante
from app.models.usuarios.estudiante_model import Estudiante

# Importamos el modelo del docente para utilizar los datos que necesitamos
from app.models.usuarios.docente_model import Docente

# Importamos de SQLAlchemy Session para usar el Typehint
from sqlalchemy.orm import Session

# Importamos del modulo datetime la clase datetime para el Typehint
from datetime import datetime

# Importamos del modulo typing el tipo List
from typing import List


class ManagerClases:
    """
    La clase ManagerClases se encargaria de la creacion de las clases,
    El registro de los estudiantes, listar las clases del docente,
    Y consultar los estudiantes que esten registrados en una clase en la db
    """

    def __init__(self):
        pass

    def registrar_estudiante(
        self, clase: ClaseCreada, estudiante: EstudianteCreado
    ) -> ClaseCreada:
        """
        Este metodo se encarcarga de guardar al estudiante en la lista de estudiantes de la clase:
        - Añadimos a la lista de la clase al estudiante
        - Retornamos la clase despues de añadir el estudiante
        """
        # Añadimos el estudiante a la lista
        clase.estudiantes.append(estudiante)
        # Retornamos la clase tras la modificacion
        return clase

    def consultar_estudiantes(
        self, clase_id: int, estudiante_id: int, db: Session
    ) -> bool:
        """
        Este metodo se encarga de consultar si un estudiante asistio a una clase:
        - Abrimos una query para buscar en la base de Datos la clase y el estudiante por ID
        - Si el resultado de la consulta fue None, retornamos false
        """
        # Realizamos la consulta
        consulta = (
            db.query(Estudiante)
            .join(Clase.estudiantes)
            .filter(Clase.id == clase_id, Estudiante.id == estudiante_id)
            .first()
        )
        # Evaluamos el resultado de la consulta
        if consulta is None:
            return False
        # Retornamos que la consulta fue exitosa, por ende el estudiante estuvo en esa clase
        return True
