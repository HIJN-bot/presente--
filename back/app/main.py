# Importamos de fastapi la clase FastAPI para isntanciar la aplicacion
from fastapi import FastAPI

# Importamos de fastapi la configuracion del CORS

from fastapi.middleware.cors import CORSMiddleware

# Importamos el router de registro de estudiantes
from app.routers.estudiantes import registro as registro_estudiantes

# Importamos el router de login de estudiantes
from app.routers.estudiantes import login as login_estudiantes

# Importamos el router de registro de docentes
from app.routers.docentes import registro as registro_docentes

# Importamos el router de login de docentes
from app.routers.docentes import login as login_docentes

# Importamos el router de creacion de la clase
from app.routers.clases import creacion as creacion_clase

# Importamos el router de la consulta de la clase
from app.routers.clases import consultar as consultar_clase

# Importamos el router para eliminar la clase
from app.routers.clases import eliminar as eliminar_clase

# Importamos el router para enviar el QR al Front-End
from app.routers.qr import enviar as enviar_qr

# Importamos el router del registro de la asistencia
from app.routers.asistencias import registrar as registrar_asistencia

# Importamos el router de la consulta a la asistencia de la clase
from app.routers.asistencias import consultar as consultar_asistencia

# instanciamos la aplicacion de FastAPI
app: FastAPI = FastAPI(
    title="Presente", description="Sistema de registro por QR", version="0.1.0"
)


# Función para validar orígenes dinámicamente
def is_allowed_origin(origin: str) -> bool:
    if origin in [
        "http://localhost",
        "http://localhost:80",
        "http://localhost:5173",
        "http://127.0.0.1",
        "http://127.0.0.1:80",
        "http://127.0.0.1:5173",
    ]:
        return True
    # Permitir cualquier origen de Render (*.onrender.com)
    if origin and origin.endswith(".onrender.com"):
        return True
    return False


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https?://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montamos los routers de estudiantes en la aplicacion
app.include_router(registro_estudiantes.router, prefix="/api", tags=["estudiantes"])
app.include_router(login_estudiantes.router, prefix="/api", tags=["estudiantes"])
# Montamos los routers de los docentes en la aplicacion
app.include_router(registro_docentes.router, prefix="/api", tags=["docentes"])
app.include_router(login_docentes.router, prefix="/api", tags=["docentes"])
# Montamos los routers de la clase en la aplicacion
app.include_router(creacion_clase.router, prefix="/api", tags=["clases"])
app.include_router(consultar_clase.router, prefix="/api", tags=["clases"])
app.include_router(eliminar_clase.router, prefix="/api", tags=["clases"])
# Montamos el router del envio del QR a la aplicacion
app.include_router(enviar_qr.router, prefix="/api", tags=["qr"])
# Montamos los routers de la asistencia en la aplicacion
app.include_router(registrar_asistencia.router, prefix="/api", tags=["asistencia"])
app.include_router(consultar_asistencia.router, prefix="/api", tags=["asistencia"])


# Funcion principal de la aplicacion
@app.get("/")
async def root():
    return {"message": "FastAPI funcionando"}
