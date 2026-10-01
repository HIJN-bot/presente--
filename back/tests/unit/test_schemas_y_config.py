# Pruebas unitarias del schema de notas y de los helpers de app/config.py

import pytest
from pydantic import ValidationError

from app import config
from app.schemas.notas.nota_schema import NotaCreada


class TestNotaCreada:
    def test_recorta_espacios_de_los_extremos(self):
        assert NotaCreada(contenido="  Repasar tema 3  ").contenido == "Repasar tema 3"

    @pytest.mark.parametrize("contenido", ["", "   ", "\n\t"])
    def test_rechaza_nota_vacia(self, contenido):
        with pytest.raises(ValidationError) as error:
            NotaCreada(contenido=contenido)
        assert error.value.errors()[0]["type"] == "string_too_short"

    def test_acepta_exactamente_500_caracteres(self):
        assert len(NotaCreada(contenido="x" * 500).contenido) == 500

    def test_rechaza_mas_de_500_caracteres(self):
        with pytest.raises(ValidationError) as error:
            NotaCreada(contenido="x" * 501)
        assert error.value.errors()[0]["type"] == "string_too_long"


class TestConfig:
    def test_requerir_falla_si_la_variable_no_existe(self, monkeypatch):
        monkeypatch.delenv("VARIABLE_QUE_NO_EXISTE", raising=False)
        with pytest.raises(RuntimeError, match="VARIABLE_QUE_NO_EXISTE"):
            config.requerir("VARIABLE_QUE_NO_EXISTE")

    def test_requerir_falla_si_la_variable_esta_vacia(self, monkeypatch):
        monkeypatch.setenv("VARIABLE_VACIA", "")
        with pytest.raises(RuntimeError):
            config.requerir("VARIABLE_VACIA")

    def test_lista_limpia_espacios_y_elementos_vacios(self, monkeypatch):
        monkeypatch.setenv("ORIGENES", " http://a.dev , ,http://b.dev,")
        assert config.lista("ORIGENES") == ["http://a.dev", "http://b.dev"]

    def test_la_clave_de_las_pruebas_no_es_la_del_env(self):
        # conftest genera una SECRET_KEY aleatoria: ningun secreto real se usa en las pruebas
        from tests.conftest import _VALORES_ENV

        assert config.SECRET_KEY != _VALORES_ENV.get("SECRET_KEY")
        assert len(config.SECRET_KEY) >= 32
