# Pruebas unitarias de app/services/usuarios/auth_service.py (hash y tokens JWT)

from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.config import SECRET_KEY, TOKEN_EXPIRACION_HORAS
from app.services.usuarios.auth_service import (
    ALGORITMO,
    decodificar_token,
    generar_hash,
    generar_token,
    verificar_hash,
)


def _token(datos: dict, clave: str = SECRET_KEY) -> str:
    return jwt.encode(datos, clave, algorithm=ALGORITMO)


def _ahora():
    return datetime.now(timezone.utc)


class TestHash:
    def test_el_hash_no_es_la_contrasena_y_se_verifica(self):
        hash_guardado = generar_hash("mi-contrasena")
        assert hash_guardado != "mi-contrasena"
        assert verificar_hash("mi-contrasena", hash_guardado)

    def test_contrasena_incorrecta_no_se_verifica(self):
        assert not verificar_hash("otra", generar_hash("mi-contrasena"))

    def test_acepta_el_hash_en_bytes(self):
        assert verificar_hash("clave", generar_hash("clave").encode("utf-8"))

    def test_dos_hashes_de_la_misma_contrasena_son_distintos(self):
        # El salt aleatorio evita que dos usuarios con la misma clave tengan el mismo hash
        assert generar_hash("clave") != generar_hash("clave")


class TestGenerarToken:
    def test_contiene_email_rol_y_expiracion(self):
        datos = decodificar_token(generar_token("teacher", "ana@presente.dev"))
        assert datos["sub"] == "ana@presente.dev"
        assert datos["rol"] == "teacher"
        duracion = datos["exp"] - datos["iat"]
        assert duracion == TOKEN_EXPIRACION_HORAS * 3600

    def test_es_un_jwt_firmado_con_hs256(self):
        token = generar_token("student", "e@presente.dev")
        assert token.count(".") == 2
        assert jwt.get_unverified_header(token)["alg"] == "HS256"


class TestDecodificarToken:
    def test_token_alterado_es_rechazado(self):
        token = generar_token("student", "e@presente.dev")
        encabezado, carga, firma = token.split(".")
        otra_carga = _token({"sub": "otro@presente.dev", "rol": "teacher", "exp": _ahora() + timedelta(hours=1)}).split(".")[1]
        with pytest.raises(jwt.InvalidSignatureError):
            decodificar_token(f"{encabezado}.{otra_carga}.{firma}")

    def test_token_firmado_con_otra_clave_es_rechazado(self):
        token = _token({"sub": "e@presente.dev", "rol": "student", "exp": _ahora() + timedelta(hours=1)}, clave="x" * 48)
        with pytest.raises(jwt.InvalidSignatureError):
            decodificar_token(token)

    def test_token_vencido_es_rechazado(self):
        token = _token({"sub": "e@presente.dev", "rol": "student", "exp": _ahora() - timedelta(seconds=1)})
        with pytest.raises(jwt.ExpiredSignatureError):
            decodificar_token(token)

    @pytest.mark.parametrize("falta", ["sub", "rol", "exp"])
    def test_token_sin_datos_obligatorios_es_rechazado(self, falta):
        datos = {"sub": "e@presente.dev", "rol": "student", "exp": _ahora() + timedelta(hours=1)}
        del datos[falta]
        with pytest.raises(jwt.MissingRequiredClaimError):
            decodificar_token(_token(datos))

    def test_token_con_algoritmo_none_es_rechazado(self):
        # Ataque clasico: un token "sin firma" no debe aceptarse nunca
        token = jwt.encode({"sub": "e@presente.dev", "rol": "teacher", "exp": _ahora() + timedelta(hours=1)}, None, algorithm="none")
        with pytest.raises(jwt.InvalidTokenError):
            decodificar_token(token)

    def test_texto_que_no_es_un_token_es_rechazado(self):
        with pytest.raises(jwt.InvalidTokenError):
            decodificar_token("esto-no-es-un-token")
