# Importamos el modelo base Usuario ya validado con Pydantic
import usuario_schema as us


# Clase para guardar los datos del estudiante
class EstudianteCreado(us.UsuarioCreado):
    pass
