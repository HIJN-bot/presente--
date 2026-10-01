# Fixtures de las pruebas de integracion: API real (FastAPI TestClient) contra una
# base PostgreSQL de pruebas creada y migrada con Alembic al inicio de la sesion.

from pathlib import Path
from urllib.parse import urlparse, urlunparse

import psycopg2
import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from psycopg2 import sql
from sqlalchemy import text

from tests.conftest import URL_PRUEBAS

CONTRASENA_PRUEBA = "clave-de-prueba-123"
RAIZ_BACK = Path(__file__).resolve().parents[2]


def _crear_base_si_no_existe(url: str) -> None:
    """Crea la base de pruebas conectandose a la base de mantenimiento 'postgres'."""
    partes = urlparse(url)
    nombre = partes.path.lstrip("/")
    url_mantenimiento = urlunparse(partes._replace(path="/postgres"))
    conexion = psycopg2.connect(url_mantenimiento)
    conexion.autocommit = True
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (nombre,))
            if cursor.fetchone() is None:
                cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(nombre)))
    finally:
        conexion.close()


@pytest.fixture(scope="session", autouse=True)
def base_de_pruebas():
    """
    Prepara la base una sola vez por sesion. Bajar hasta 'base' y volver a subir
    hasta 'head' ejecuta todas las migraciones en ambos sentidos, asi que tambien
    comprueba que cada downgrade funcione.
    """
    if URL_PRUEBAS is None:
        pytest.fail("No hay base de pruebas: define DATABASE_URL o TEST_DATABASE_URL en back/.env")
    try:
        _crear_base_si_no_existe(URL_PRUEBAS)
    except psycopg2.OperationalError as error:
        pytest.fail(f"No se pudo conectar a PostgreSQL para las pruebas: {error.__class__.__name__}")

    configuracion = Config(str(RAIZ_BACK / "alembic.ini"))
    configuracion.set_main_option("script_location", str(RAIZ_BACK / "alembic"))
    command.downgrade(configuracion, "base")
    command.upgrade(configuracion, "head")
    yield


@pytest.fixture(autouse=True)
def limpiar_tablas(base_de_pruebas):
    """Deja todas las tablas vacias antes de cada prueba."""
    from app.database import engine

    with engine.begin() as conexion:
        conexion.execute(text(
            "TRUNCATE notas, asistencia_clase_estudiante, clase, docentes, estudiantes "
            "RESTART IDENTITY CASCADE"
        ))
    yield


@pytest.fixture
def cliente():
    from app.main import app

    with TestClient(app) as cliente:
        yield cliente


@pytest.fixture
def db():
    from app.database import SessionLocal

    sesion = SessionLocal()
    try:
        yield sesion
    finally:
        sesion.close()


@pytest.fixture
def registrar(cliente):
    """Registra un usuario y devuelve su token. rol: 'docentes' o 'estudiantes'."""

    def _registrar(rol: str, email: str, nombre: str = "Nombre", apellido: str = "Apellido") -> str:
        respuesta = cliente.post(
            f"/api/{rol}/registro",
            json={"nombre": nombre, "apellido": apellido, "email": email, "contrasena": CONTRASENA_PRUEBA},
        )
        assert respuesta.status_code == 201, respuesta.text
        return respuesta.json()["token"]

    return _registrar


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def crear_clase(cliente):
    """Crea una clase para el docente del token y devuelve su id."""

    def _crear(token: str, email_docente: str, materia: str = "Matemáticas", horario: str = "2026-10-01T08:00:00") -> int:
        respuesta = cliente.post(
            f"/api/clases/creacion?email_docente={email_docente}",
            json={"materia": materia, "horario": horario},
            headers=auth(token),
        )
        assert respuesta.status_code == 201, respuesta.text
        return respuesta.json()["id"]

    return _crear
