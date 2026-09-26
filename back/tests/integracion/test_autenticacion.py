# Integracion: registro, login y proteccion de endpoints con JWT

from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.config import SECRET_KEY
from app.services.usuarios.auth_service import decodificar_token
from tests.integracion.conftest import CONTRASENA_PRUEBA, auth

DOCENTE = "docente@presente.dev"
ESTUDIANTE = "estudiante@presente.dev"


@pytest.mark.parametrize("rol, nombre_rol", [("docentes", "teacher"), ("estudiantes", "student")])
def test_registro_devuelve_jwt_con_el_rol_y_el_email(cliente, rol, nombre_rol):
    respuesta = cliente.post(
        f"/api/{rol}/registro",
        json={"nombre": "Ana", "apellido": "Ruiz", "email": "ana@presente.dev", "contrasena": CONTRASENA_PRUEBA},
    )
    assert respuesta.status_code == 201
    cuerpo = respuesta.json()
    assert cuerpo["role"] == nombre_rol
    assert cuerpo["user"] == {"nombre": "Ana", "apellido": "Ruiz", "email": "ana@presente.dev"}
    datos = decodificar_token(cuerpo["token"])
    assert (datos["sub"], datos["rol"]) == ("ana@presente.dev", nombre_rol)


def test_registro_con_email_repetido_responde_409(cliente, registrar):
    registrar("estudiantes", ESTUDIANTE)
    respuesta = cliente.post(
        "/api/estudiantes/registro",
        json={"nombre": "N", "apellido": "A", "email": ESTUDIANTE, "contrasena": CONTRASENA_PRUEBA},
    )
    assert respuesta.status_code == 409


@pytest.mark.parametrize("contrasena", ["corta", "x" * 73])
def test_registro_rechaza_contrasenas_fuera_de_limites(cliente, contrasena):
    respuesta = cliente.post(
        "/api/estudiantes/registro",
        json={"nombre": "N", "apellido": "A", "email": ESTUDIANTE, "contrasena": contrasena},
    )
    assert respuesta.status_code == 422


def test_la_respuesta_del_registro_no_incluye_la_contrasena_ni_el_hash(cliente):
    respuesta = cliente.post(
        "/api/docentes/registro",
        json={"nombre": "N", "apellido": "A", "email": DOCENTE, "contrasena": CONTRASENA_PRUEBA},
    )
    assert CONTRASENA_PRUEBA not in respuesta.text
    assert "hash" not in respuesta.text


def test_login_correcto_devuelve_un_token_que_da_acceso(cliente, registrar):
    registrar("docentes", DOCENTE)
    login = cliente.post("/api/docentes/login", json={"email": DOCENTE, "contrasena": CONTRASENA_PRUEBA})
    assert login.status_code == 200
    token = login.json()["token"]
    assert cliente.get(f"/api/clases/consultar?email_docente={DOCENTE}", headers=auth(token)).status_code == 200


def test_login_incorrecto_responde_401_sin_revelar_si_el_email_existe(cliente, registrar):
    registrar("estudiantes", ESTUDIANTE)
    clave_mala = cliente.post("/api/estudiantes/login", json={"email": ESTUDIANTE, "contrasena": "incorrecta"})
    email_inexistente = cliente.post("/api/estudiantes/login", json={"email": "nadie@presente.dev", "contrasena": "x"})
    assert clave_mala.status_code == email_inexistente.status_code == 401
    assert clave_mala.json() == email_inexistente.json()


def test_un_estudiante_no_puede_iniciar_sesion_como_docente(cliente, registrar):
    registrar("estudiantes", ESTUDIANTE)
    respuesta = cliente.post("/api/docentes/login", json={"email": ESTUDIANTE, "contrasena": CONTRASENA_PRUEBA})
    assert respuesta.status_code == 401


# Cada endpoint protegido, con una peticion valida en todo menos en el token
ENDPOINTS_PROTEGIDOS = [
    ("get", f"/api/clases/consultar?email_docente={DOCENTE}", None),
    ("post", f"/api/clases/creacion?email_docente={DOCENTE}", {"materia": "M", "horario": "2026-10-01T08:00:00"}),
    ("delete", "/api/clases/eliminar?clase_id=1", None),
    ("get", "/api/qr?id_clase=1", None),
    ("get", f"/api/asistencia/consulta?id_clase=1&email_docente={DOCENTE}", None),
    ("post", "/api/asistencia/registro", {"id_clase": 1, "email_estudiante": ESTUDIANTE}),
    ("get", f"/api/asistencia/historial?email_estudiante={ESTUDIANTE}", None),
    ("get", f"/api/notas/consultar?email_estudiante={ESTUDIANTE}", None),
    ("post", f"/api/notas/creacion?email_estudiante={ESTUDIANTE}", {"contenido": "hola"}),
]


def _pedir(cliente, metodo, url, cuerpo, headers=None):
    return cliente.request(metodo.upper(), url, json=cuerpo, headers=headers or {})


@pytest.mark.parametrize("metodo, url, cuerpo", ENDPOINTS_PROTEGIDOS)
def test_endpoint_protegido_sin_token_responde_401(cliente, metodo, url, cuerpo):
    respuesta = _pedir(cliente, metodo, url, cuerpo)
    assert respuesta.status_code == 401
    assert respuesta.headers["www-authenticate"] == "Bearer"


@pytest.mark.parametrize("metodo, url, cuerpo", ENDPOINTS_PROTEGIDOS)
def test_endpoint_protegido_con_token_falso_responde_401(cliente, metodo, url, cuerpo):
    falso = jwt.encode(
        {"sub": DOCENTE, "rol": "teacher", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        "clave-de-un-atacante-" * 3,
        algorithm="HS256",
    )
    assert _pedir(cliente, metodo, url, cuerpo, auth(falso)).status_code == 401


def test_token_vencido_responde_401_con_mensaje_claro(cliente, registrar):
    registrar("docentes", DOCENTE)
    vencido = jwt.encode(
        {"sub": DOCENTE, "rol": "teacher", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
        SECRET_KEY,
        algorithm="HS256",
    )
    respuesta = cliente.get(f"/api/clases/consultar?email_docente={DOCENTE}", headers=auth(vencido))
    assert respuesta.status_code == 401
    assert respuesta.json()["detail"] == "Tu sesión expiró, inicia sesión de nuevo"


def test_los_endpoints_de_docente_rechazan_tokens_de_estudiante(cliente, registrar):
    token = registrar("estudiantes", ESTUDIANTE)
    respuesta = cliente.get(f"/api/clases/consultar?email_docente={ESTUDIANTE}", headers=auth(token))
    assert respuesta.status_code == 403


def test_los_endpoints_de_estudiante_rechazan_tokens_de_docente(cliente, registrar):
    token = registrar("docentes", DOCENTE)
    respuesta = cliente.get(f"/api/notas/consultar?email_estudiante={DOCENTE}", headers=auth(token))
    assert respuesta.status_code == 403
