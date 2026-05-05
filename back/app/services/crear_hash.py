#Importamos el schema del usuario de Pydantic
from app.schemas import usuario_schema as us
#Importamos la funcion para hashear la contraseña
from app.services.auth_service import generar_hash 

def hashear_contrasena(usuario: us.UsuarioCreado):
    '''
    Creamos una copia del schema con la contraseña hasheada
    Retornamos la nueva instancia
    '''
    usuario_con_hash = usuario.model_copy(update={
        "contrasena": generar_hash(usuario.contrasena)
    })

    return usuario_con_hash
