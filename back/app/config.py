# Importamos os para leer las variables de entorno del sistema
import os

# Importamos logging para avisar de configuraciones problematicas al arrancar
import logging

# Importamos la funcion que nos permite cargar el archivo .env
from dotenv import load_dotenv

# Logger de configuracion, visible en los logs del servicio
logger = logging.getLogger(__name__)

# Cargamos el .env una sola vez para toda la aplicacion.
# Cualquier modulo que necesite configuracion debe importarla desde aqui,
# nunca leer os.getenv por su cuenta ni escribir una URL o clave en el codigo.
load_dotenv()


def requerir(nombre: str) -> str:
    """
    Lee una variable de entorno obligatoria.
    - Si no esta definida lanzamos un error explicito al arrancar.
    - Preferimos fallar de inmediato antes que arrancar con un valor por defecto
      equivocado, porque un default silencioso apunta la app a la base de datos
      o al frontend incorrecto y el bug aparece mucho despues.
    """
    valor = os.getenv(nombre)
    if not valor:
        raise RuntimeError(
            f"Falta la variable de entorno obligatoria '{nombre}'. "
            f"Revisa tu archivo .env (o las variables del servicio en Render). "
            f"Puedes guiarte con .env.example."
        )
    return valor


def opcional(nombre: str, defecto: str = "") -> str:
    """
    Lee una variable de entorno que puede no estar definida.
    - Devuelve el valor por defecto cuando falta.
    - Solo la usamos para configuracion que no rompe la aplicacion si no esta.
    """
    return os.getenv(nombre, defecto)


def lista(nombre: str, defecto: str = "") -> list[str]:
    """
    Lee una variable de entorno con varios valores separados por comas.
    - Ejemplo: ALLOWED_ORIGINS=http://localhost:5173,http://localhost
    - Limpiamos espacios y descartamos los elementos vacios para tolerar
      comas sobrantes al final de la linea.
    """
    crudo = opcional(nombre, defecto)
    return [item.strip() for item in crudo.split(",") if item.strip()]


# URL de conexion a PostgreSQL. Obligatoria: sin base de datos no hay aplicacion.
DATABASE_URL = requerir("DATABASE_URL")


def _revisar_url_de_supabase(url: str) -> None:
    """
    Avisa de los dos errores tipicos al conectar con Supabase desde un hosting
    como Render. No bloquea el arranque: solo deja el diagnostico en los logs,
    porque el fallo real aparece mas tarde como un timeout dificil de leer.
    """
    if "supabase" not in url:
        return

    # La conexion directa (db.<ref>.supabase.co) resuelve solo por IPv6, y muchos
    # hostings no tienen salida IPv6: la conexion queda colgada hasta el timeout.
    # Las cadenas del pooler llevan "pooler.supabase.com" en el host.
    if "db." in url and "pooler" not in url:
        logger.warning(
            "DATABASE_URL parece la conexion DIRECTA de Supabase (db.<ref>.supabase.co), "
            "que solo resuelve por IPv6. Si el hosting no tiene salida IPv6 la conexion "
            "fallara por timeout. Usa la cadena del Session pooler (pooler.supabase.com:5432)."
        )

    # Supabase exige TLS. psycopg2 negocia SSL por defecto, pero dejarlo explicito
    # evita sorpresas si algun dia cambia el default del driver.
    if "sslmode=" not in url:
        logger.info(
            "DATABASE_URL no especifica sslmode. Supabase requiere TLS; "
            "puedes anadir '?sslmode=require' al final para dejarlo explicito."
        )


_revisar_url_de_supabase(DATABASE_URL)

# URL base del frontend, usada para construir la direccion que codifica el QR.
# Obligatoria: si apunta al sitio equivocado el QR lleva a los estudiantes a otra parte.
FRONTEND_BASE_URL = requerir("FRONTEND_BASE_URL")

# Origenes exactos autorizados para CORS (lista separada por comas).
# El default cubre el desarrollo local para que el proyecto arranque sin configuracion extra.
ALLOWED_ORIGINS = lista(
    "ALLOWED_ORIGINS",
    "http://localhost,http://localhost:80,http://localhost:5173,"
    "http://127.0.0.1,http://127.0.0.1:80,http://127.0.0.1:5173",
)

# Patron opcional para autorizar familias enteras de dominios en CORS
# (por ejemplo los subdominios de Render o los dev tunnels de VS Code).
# Vacio significa "sin patron": solo valen los origenes exactos de arriba.
ALLOWED_ORIGIN_REGEX = opcional("ALLOWED_ORIGIN_REGEX") or None

# Entorno de ejecucion, util para condicionar comportamiento de desarrollo o produccion.
ENV = opcional("ENV", "development")
