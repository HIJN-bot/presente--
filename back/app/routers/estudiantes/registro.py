#De fastapi importamos el Router de la API, la funcion para inyectar dependencias y la excepcion
from fastapi import APIRouter, Depends, HTTPException
#Importamos el archivo del esquema de estudiantes
from app.schemas import estudiante_schema as es
#Importamos de SQLAlchemy las sesiones para poder usarlas e interactuar con la Base de Datos
from sqlalchemy.orm import Session
#Importamos de database.py la funcion get_db para poder crear las sesiones
from app.database import get_db
#Importamos el modelo ORM
from app.models import estudiante_model as em
#Importamos servicios necesarios
from app.services.crear_hash import hashear_contrasena
from app.services.crear_usuario import crear_usuario

#Instanciamos el Router para crear la API
router: APIRouter = APIRouter()

#Definimos el metodo HTTP para nuestra API
@router.post("/estudiantes")

#Definimos la funcion del Endpoint, y solicitamos el estudiante creado
#Ademas pedimos la base de datos para usar las sesiones y registrar a los usuarios
async def registrar_estudiante(informacion_estudiante: es.EstudianteCreado, db: Session=Depends(get_db)):
    '''
    Recibimos los datos del estudiante, hasheamos la contraseña,
    creamos la instancia del ORM y la guardamos en la Base de Datos
    '''
    try:
        #Hasheamos la contraseña y modificamos el atributo 
        estudiante_con_hash = hashear_contrasena(informacion_estudiante)
        #Convertimos el schema a diccionario
        datos_estudiante = crear_usuario(estudiante_con_hash)
        
        #Cambiamos 'contrasena' a 'hash_contrasena' para que coincida con la BD
        datos_estudiante['hash_contrasena'] = datos_estudiante.pop('contrasena')
        #Instanciar el modelo ORM Estudiante con los datos
        estudiante = em.Estudiante(**datos_estudiante)
        
        # Paso 5: Agregar a la sesión, guardar y refrescar
        db.add(estudiante)
        db.commit()
        db.refresh(estudiante)

        # Retornar el estudiante creado con código 201
        return {"id": estudiante.id, "nombre": estudiante.nombre, "email": estudiante.email, "status_code": 201}
    
    except ValueError as e:
        # Si hay error de validación
        raise HTTPException(status_code=400, detail=f"Datos inválidos: {str(e)}")
    except Exception as e:
        # Si hay error en la base de datos (ej: email duplicado)
        raise HTTPException(status_code=400, detail="No se pudo registrar al estudiante")