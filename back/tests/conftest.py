# Configuracion comun de las pruebas.
#
# Este archivo se carga antes que cualquier modulo de la aplicacion, asi que aqui
# fijamos las variables de entorno con las que arranca app.config:
# - DATABASE_URL apunta SIEMPRE a una base de datos de pruebas (nombre terminado
#   en "_test"), nunca a la de desarrollo.
# - SECRET_KEY es aleatoria en cada ejecucion: ningun secreto real entra en las pruebas.
#
# La base de pruebas se toma de TEST_DATABASE_URL (entorno o back/.env). Si no esta
# definida se deriva de DATABASE_URL cambiando el nombre de la base por "<nombre>_test",
# asi no hace falta escribir credenciales en ningun archivo del repositorio.

import os
import secrets
from pathlib import Path
from urllib.parse import urlparse, urlunparse

import pytest
from dotenv import dotenv_values

_VALORES_ENV = dotenv_values(Path(__file__).resolve().parent.parent / ".env")


def _leer(nombre: str) -> str | None:
    return os.getenv(nombre) or _VALORES_ENV.get(nombre)


def url_base_de_pruebas() -> str | None:
    """URL de la base de datos de pruebas, o None si no hay ninguna configurada."""
    explicita = _leer("TEST_DATABASE_URL")
    if explicita:
        return explicita
    base = _leer("DATABASE_URL")
    if not base:
        return None
    partes = urlparse(base)
    nombre = partes.path.lstrip("/")
    if not nombre.endswith("_test"):
        nombre = f"{nombre}_test"
    return urlunparse(partes._replace(path=f"/{nombre}"))


URL_PRUEBAS = url_base_de_pruebas()

if URL_PRUEBAS is not None and not urlparse(URL_PRUEBAS).path.endswith("_test"):
    raise pytest.UsageError(
        "La base de datos de pruebas debe terminar en '_test' para no tocar datos reales."
    )

# Sin base de pruebas las pruebas unitarias igual pueden correr: usamos una URL que
# nunca se conecta (el engine de SQLAlchemy no abre conexiones hasta usarse).
os.environ["DATABASE_URL"] = URL_PRUEBAS or "postgresql://sin-configurar@127.0.0.1:1/sin_base_test"
os.environ["SECRET_KEY"] = secrets.token_urlsafe(48)
os.environ["TOKEN_EXPIRACION_HORAS"] = "12"
os.environ.setdefault("FRONTEND_BASE_URL", "http://localhost:5173")
