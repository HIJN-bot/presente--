# Importamos de fastapi la clase FastAPI para isntanciar la aplicacion
from fastapi import FastAPI

# Importamos el router de registro de estudiantes
from app.routers.estudiantes import registro

# Importamos el router de login de estudiantes
from app.routers.estudiantes import login

# instanciamos la aplicacion de FastAPI
app: FastAPI = FastAPI(
    title="Presente", description="Sistema de registro por QR", version="0.1.0"
)

# Montamos los routers de estudiantes en la aplicacion
app.include_router(registro.router, prefix="/api", tags=["estudiantes"])
app.include_router(login.router, prefix="/api", tags=["estudiantes"])


# Funcion principal de la aplicacion
@app.get("/")
async def root():
    return {"message": "FastAPI funcionando"}
