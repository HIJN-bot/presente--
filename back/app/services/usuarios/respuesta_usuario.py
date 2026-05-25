# Importamos el schema de respuesta
from app.schemas.usuarios import respuesta_schema as rs


# Definimos la funcion que nos permita crear el schema de respuesta
def crear_respuesta(**kwargs) -> rs.RespuestaUsuario:
    respuesta_usuario: rs.RespuestaUsuario = rs.RespuestaUsuario(**kwargs)
    return respuesta_usuario
