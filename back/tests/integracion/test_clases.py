# Integracion: crear, consultar y eliminar clases, y obtener su QR

import base64

from sqlalchemy import select, text

from app.models.usuarios.estudiante_model import Estudiante
from tests.integracion.conftest import auth

DOCENTE = "docente@presente.dev"
OTRO_DOCENTE = "otro.docente@presente.dev"
ESTUDIANTE = "estudiante@presente.dev"


def test_crear_clase_genera_un_qr_png_que_apunta_a_la_asistencia(cliente, registrar):
    token = registrar("docentes", DOCENTE)
    respuesta = cliente.post(
        f"/api/clases/creacion?email_docente={DOCENTE}",
        json={"materia": "Cálculo", "horario": "2026-10-01T08:00:00"},
        headers=auth(token),
    )
    assert respuesta.status_code == 201
    clase = respuesta.json()
    assert clase["materia"] == "Cálculo"
    assert base64.b64decode(clase["qr"]).startswith(b"\x89PNG")


def test_consultar_clases_lista_solo_las_del_docente(cliente, registrar, crear_clase):
    token = registrar("docentes", DOCENTE)
    token_otro = registrar("docentes", OTRO_DOCENTE)
    crear_clase(token, DOCENTE, materia="Mía")
    crear_clase(token_otro, OTRO_DOCENTE, materia="Ajena")

    clases = cliente.get(f"/api/clases/consultar?email_docente={DOCENTE}", headers=auth(token)).json()
    assert [c["materia"] for c in clases] == ["Mía"]
    assert clases[0]["student_count"] == 0


def test_un_docente_no_puede_consultar_ni_crear_clases_de_otro(cliente, registrar):
    registrar("docentes", DOCENTE)
    token_otro = registrar("docentes", OTRO_DOCENTE)
    consulta = cliente.get(f"/api/clases/consultar?email_docente={DOCENTE}", headers=auth(token_otro))
    creacion = cliente.post(
        f"/api/clases/creacion?email_docente={DOCENTE}",
        json={"materia": "M", "horario": "2026-10-01T08:00:00"},
        headers=auth(token_otro),
    )
    assert consulta.status_code == creacion.status_code == 403


def test_un_docente_no_puede_eliminar_la_clase_de_otro(cliente, registrar, crear_clase):
    token = registrar("docentes", DOCENTE)
    token_otro = registrar("docentes", OTRO_DOCENTE)
    id_clase = crear_clase(token, DOCENTE)

    assert cliente.delete(f"/api/clases/eliminar?clase_id={id_clase}", headers=auth(token_otro)).status_code == 403
    clases = cliente.get(f"/api/clases/consultar?email_docente={DOCENTE}", headers=auth(token)).json()
    assert len(clases) == 1


def test_eliminar_clase_propia(cliente, registrar, crear_clase):
    token = registrar("docentes", DOCENTE)
    id_clase = crear_clase(token, DOCENTE)
    assert cliente.delete(f"/api/clases/eliminar?clase_id={id_clase}", headers=auth(token)).status_code == 200
    assert cliente.get(f"/api/clases/consultar?email_docente={DOCENTE}", headers=auth(token)).json() == []


def test_eliminar_clase_inexistente_responde_404(cliente, registrar):
    token = registrar("docentes", DOCENTE)
    assert cliente.delete("/api/clases/eliminar?clase_id=999", headers=auth(token)).status_code == 404


def test_regresion_eliminar_clase_conserva_a_los_estudiantes(cliente, registrar, crear_clase, db):
    # Antes Clase.estudiantes tenia cascade="all, delete" y borrar la clase
    # borraba tambien las cuentas de los estudiantes que habian asistido.
    token = registrar("docentes", DOCENTE)
    token_estudiante = registrar("estudiantes", ESTUDIANTE)
    id_clase = crear_clase(token, DOCENTE)
    cliente.post(
        "/api/asistencia/registro",
        json={"id_clase": id_clase, "email_estudiante": ESTUDIANTE},
        headers=auth(token_estudiante),
    )
    cliente.post(
        f"/api/notas/creacion?email_estudiante={ESTUDIANTE}",
        json={"contenido": "nota"},
        headers=auth(token_estudiante),
    )

    assert cliente.delete(f"/api/clases/eliminar?clase_id={id_clase}", headers=auth(token)).status_code == 200

    assert db.execute(select(Estudiante).where(Estudiante.email == ESTUDIANTE)).scalar_one_or_none() is not None
    assert db.execute(text("SELECT count(*) FROM asistencia_clase_estudiante")).scalar() == 0
    notas = cliente.get(f"/api/notas/consultar?email_estudiante={ESTUDIANTE}", headers=auth(token_estudiante))
    assert len(notas.json()) == 1


def test_qr_solo_para_el_docente_dueno(cliente, registrar, crear_clase):
    token = registrar("docentes", DOCENTE)
    token_otro = registrar("docentes", OTRO_DOCENTE)
    id_clase = crear_clase(token, DOCENTE)

    propio = cliente.get(f"/api/qr?id_clase={id_clase}", headers=auth(token))
    assert propio.status_code == 200
    assert base64.b64decode(propio.json()["imagen_qr"]).startswith(b"\x89PNG")
    assert cliente.get(f"/api/qr?id_clase={id_clase}", headers=auth(token_otro)).status_code == 403
    assert cliente.get("/api/qr?id_clase=999", headers=auth(token)).status_code == 404
