# Importamos de Pydantic EmailStr
from pydantic import EmailStr

# Importamos select() de SQLALchemy para la consulta
from sqlalchemy import select

# Importamos las sesiones de SQLAlchemy para la consulta en la Base de Datos
from sqlalchemy.orm import Session

# Importamos el modelo ORM del usuario
from app.models import usuario_model as um


# Definimos la funcion para validar que el email que estamos registrando no este en la Base de Datos
def validar_email(
    email_ingresado: EmailStr, modelo_usuario: um.Usuario, db: Session
) -> bool:
    # Definimos la query con el parametro del email y buscando coincidencias
    query = select(modelo_usuario).where(modelo_usuario.email == email_ingresado)
    # Ejecutamos la consulta a la base de datos
    email_consultado = db.execute(query).scalar_one_or_none()
    # Evaluamos si la consulta encontro algo
    if email_consultado is not None:
        return False
    # Si no dio nada, significa que el email no esta registrado y podemos proceder con el registro
    return True
