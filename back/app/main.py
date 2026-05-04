#Importamos de fastapi la clase FastAPI para isntanciar la aplicacion
from fastapi import FastAPI

#instanciamos la aplicacion de FastAPI
app: FastAPI = FastAPI(
    title="Presente",
    description="Sistema de registro por QR", 
    version="0.1.0"
)

#Funcion principal de la aplicacion
@app.get("/")
async def root():
    return {"message": "FastAPI funcionando"}
