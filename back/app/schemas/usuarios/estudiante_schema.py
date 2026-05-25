# Importamos el schema base Usuario ya validado con Pydantic
import app.schemas.usuarios.usuario_schema as us


# Clase para guardar los datos del estudiante
class EstudianteCreado(us.UsuarioCreado):
    pass
