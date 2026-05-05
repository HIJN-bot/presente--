#Importamos el schema del estudiante de Pydantic
from app.schemas import usuario_schema as us

def crear_usuario(usuario: us.UsuarioCreado) -> dict:
    '''
    Convertimos el usuario a diccionario
    Retornamos el diccionario con los datos del usuario
    '''
    return usuario.model_dump()
