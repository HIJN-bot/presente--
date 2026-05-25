# Importamos de fastapi la clase FastAPI para isntanciar la aplicacion
from fastapi import FastAPI

# Importamos el router de registro de estudiantes
from app.routers.estudiantes import registro as registro_estudiantes

# Importamos el router de login de estudiantes
from app.routers.estudiantes import login

# Importamos el router de registro de docentes
from app.routers.docentes import registro as registro_docentes

# instanciamos la aplicacion de FastAPI
app: FastAPI = FastAPI(
    title="Presente", description="Sistema de registro por QR", version="0.1.0"
)

# Montamos los routers de estudiantes en la aplicacion
app.include_router(registro_estudiantes.router, prefix="/api", tags=["estudiantes"])
app.include_router(login.router, prefix="/api", tags=["estudiantes"])
# Montamos los routers de los docentes en la aplicacion
app.include_router(registro_docentes.router, prefix="/api", tags=["docentes"])


# Funcion principal de la aplicacion
@app.get("/")
async def root():
    return {"message": "FastAPI funcionando"}
