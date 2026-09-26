# Pruebas unitarias de app/services/usuarios/usuario_actual.py (dependencias de autenticacion)

from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.config import SECRET_KEY
from app.services.usuarios.auth_service import ALGORITMO, generar_token
from app.services.usuarios.usuario_actual import (
    UsuarioActual,
    obtener_usuario_actual,
    requerir_docente,
    requerir_estudiante,
    verificar_propietario,
)


def _credenciales(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


class TestObtenerUsuarioActual:
    def test_sin_token_responde_401(self):
        with pytest.raises(HTTPException) as error:
            obtener_usuario_actual(None)
        assert error.value.status_code == 401
        assert error.value.headers == {"WWW-Authenticate": "Bearer"}

    def test_token_valido_devuelve_email_y_rol(self):
        usuario = obtener_usuario_actual(_credenciales(generar_token("teacher", "d@presente.dev")))
        assert usuario == UsuarioActual(email="d@presente.dev", rol="teacher")

    def test_token_vencido_responde_401_con_mensaje_de_expiracion(self):
        vencido = jwt.encode(
            {"sub": "d@presente.dev", "rol": "teacher", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
            SECRET_KEY,
            algorithm=ALGORITMO,
        )
        with pytest.raises(HTTPException) as error:
            obtener_usuario_actual(_credenciales(vencido))
        assert error.value.status_code == 401
        assert "expiró" in error.value.detail

    def test_token_invalido_responde_401(self):
        with pytest.raises(HTTPException) as error:
            obtener_usuario_actual(_credenciales("token-invalido"))
        assert error.value.status_code == 401
        assert "no es válida" in error.value.detail


class TestRoles:
    docente = UsuarioActual(email="d@presente.dev", rol="teacher")
    estudiante = UsuarioActual(email="e@presente.dev", rol="student")

    def test_requerir_docente_acepta_docente(self):
        assert requerir_docente(self.docente) is self.docente

    def test_requerir_docente_rechaza_estudiante(self):
        with pytest.raises(HTTPException) as error:
            requerir_docente(self.estudiante)
        assert error.value.status_code == 403

    def test_requerir_estudiante_acepta_estudiante(self):
        assert requerir_estudiante(self.estudiante) is self.estudiante

    def test_requerir_estudiante_rechaza_docente(self):
        with pytest.raises(HTTPException) as error:
            requerir_estudiante(self.docente)
        assert error.value.status_code == 403


class TestVerificarPropietario:
    usuario = UsuarioActual(email="e@presente.dev", rol="student")

    def test_mismo_email_no_lanza_error(self):
        verificar_propietario("e@presente.dev", self.usuario)

    def test_ignora_mayusculas(self):
        verificar_propietario("E@Presente.DEV", self.usuario)

    @pytest.mark.parametrize("email", ["otro@presente.dev", ""])
    def test_otro_email_responde_403(self, email):
        with pytest.raises(HTTPException) as error:
            verificar_propietario(email, self.usuario)
        assert error.value.status_code == 403
