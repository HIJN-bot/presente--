# Integracion: notas personales del estudiante y la migracion de la tabla

from datetime import datetime

from sqlalchemy import inspect, select, text

from app.models.notas.nota_model import Nota
from app.models.usuarios.estudiante_model import Estudiante
from tests.integracion.conftest import auth

ESTUDIANTE = "estudiante@presente.dev"
OTRO_ESTUDIANTE = "otro.estudiante@presente.dev"


def _crear_nota(cliente, token, contenido, email=ESTUDIANTE):
    return cliente.post(
        f"/api/notas/creacion?email_estudiante={email}", json={"contenido": contenido}, headers=auth(token)
    )


def test_crear_nota_recorta_espacios_y_devuelve_fecha_con_zona_horaria(cliente, registrar):
    token = registrar("estudiantes", ESTUDIANTE)
    respuesta = _crear_nota(cliente, token, "  Repasar tema 3  ")
    assert respuesta.status_code == 201
    nota = respuesta.json()
    assert nota["contenido"] == "Repasar tema 3"
    # La fecha lleva su desfase para que el navegador la muestre en hora local
    assert datetime.fromisoformat(nota["fecha"]).tzinfo is not None


def test_nota_vacia_o_demasiado_larga_responde_422(cliente, registrar):
    token = registrar("estudiantes", ESTUDIANTE)
    assert _crear_nota(cliente, token, "   ").status_code == 422
    assert _crear_nota(cliente, token, "x" * 501).status_code == 422


def test_consultar_notas_de_la_mas_reciente_a_la_mas_antigua(cliente, registrar):
    token = registrar("estudiantes", ESTUDIANTE)
    for contenido in ["primera", "segunda", "tercera"]:
        _crear_nota(cliente, token, contenido)
    notas = cliente.get(f"/api/notas/consultar?email_estudiante={ESTUDIANTE}", headers=auth(token)).json()
    assert [n["contenido"] for n in notas] == ["tercera", "segunda", "primera"]


def test_las_notas_son_privadas(cliente, registrar):
    token = registrar("estudiantes", ESTUDIANTE)
    token_otro = registrar("estudiantes", OTRO_ESTUDIANTE)
    _crear_nota(cliente, token, "secreta")

    assert cliente.get(f"/api/notas/consultar?email_estudiante={ESTUDIANTE}", headers=auth(token_otro)).status_code == 403
    assert _crear_nota(cliente, token_otro, "suplantada", email=ESTUDIANTE).status_code == 403
    assert cliente.get(f"/api/notas/consultar?email_estudiante={OTRO_ESTUDIANTE}", headers=auth(token_otro)).json() == []


def test_borrar_un_estudiante_borra_sus_notas(cliente, registrar, db):
    token = registrar("estudiantes", ESTUDIANTE)
    _crear_nota(cliente, token, "nota")
    estudiante = db.execute(select(Estudiante).where(Estudiante.email == ESTUDIANTE)).scalar_one()

    db.delete(estudiante)
    db.commit()

    assert db.execute(select(Nota)).scalars().all() == []


def test_la_migracion_crea_la_tabla_notas_como_se_espera(db):
    inspector = inspect(db.get_bind())
    columnas = {c["name"]: c for c in inspector.get_columns("notas")}
    assert set(columnas) == {"id", "contenido", "fecha", "estudiante_id"}
    assert columnas["fecha"]["type"].timezone is True
    assert columnas["estudiante_id"]["nullable"] is False
    [clave_foranea] = inspector.get_foreign_keys("notas")
    assert clave_foranea["referred_table"] == "estudiantes"
    assert clave_foranea["options"].get("ondelete") == "CASCADE"
    assert db.execute(text("SELECT version_num FROM alembic_version")).scalar() == "a3f9c2d1e7b4"
