# Levanta la API contra la base de datos de PRUEBAS para las pruebas end-to-end del Front.
#
# Uso:  back/venv/Scripts/python.exe back/tests/servidor_e2e.py
#
# Reutiliza la configuracion de tests/conftest.py: base "<nombre>_test" (nunca la de
# desarrollo) y una SECRET_KEY aleatoria. Aplica las migraciones y sirve en el puerto 8001.

import sys
from pathlib import Path

# Permite ejecutarlo como script desde cualquier carpeta
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import uvicorn  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402

import tests.conftest  # noqa: F401,E402  (fija DATABASE_URL, SECRET_KEY y FRONTEND_BASE_URL de pruebas)
from tests.integracion.conftest import RAIZ_BACK, _crear_base_si_no_existe  # noqa: E402
from tests.conftest import URL_PRUEBAS  # noqa: E402

PUERTO = 8001

if __name__ == "__main__":
    if URL_PRUEBAS is None:
        raise SystemExit("No hay base de pruebas: define DATABASE_URL o TEST_DATABASE_URL en back/.env")
    _crear_base_si_no_existe(URL_PRUEBAS)
    configuracion = Config(str(RAIZ_BACK / "alembic.ini"))
    configuracion.set_main_option("script_location", str(RAIZ_BACK / "alembic"))
    command.upgrade(configuracion, "head")
    uvicorn.run("app.main:app", host="127.0.0.1", port=PUERTO)
