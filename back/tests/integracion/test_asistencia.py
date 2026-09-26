# Integracion: registrar asistencia, consultarla (docente) y el historial (estudiante)

from tests.integracion.conftest import auth

DOCENTE = "docente@presente.dev"
OTRO_DOCENTE = "otro.docente@presente.dev"
ESTUDIANTE = "estudiante@presente.dev"
OTRO_ESTUDIANTE = "otro.estudiante@presente.dev"


def _registrar_asistencia(cliente, token, id_clase, email=ESTUDIANTE):
    return cliente.post(
        "/api/asistencia/registro",
        json={"id_clase": id_clase, "email_estudiante": email},
        headers=auth(token),
    )


def test_registrar_asistencia_y_el_docente_la_consulta(cliente, registrar, crear_clase):
    token_docente = registrar("docentes", DOCENTE)
    token = registrar("estudiantes", ESTUDIANTE, nombre="Luis", apellido="Pérez")
    id_clase = crear_clase(token_docente, DOCENTE)

    assert _registrar_asistencia(cliente, token, id_clase).status_code == 201

    consulta = cliente.get(
        f"/api/asistencia/consulta?id_clase={id_clase}&email_docente={DOCENTE}", headers=auth(token_docente)
    )
    assert consulta.status_code == 200
    assert consulta.json()["asistencia_estudiantes"] == [
        {"id": 1, "nombre": "Luis", "apellido": "Pérez", "email": ESTUDIANTE}
    ]
    clases = cliente.get(f"/api/clases/consultar?email_docente={DOCENTE}", headers=auth(token_docente)).json()
    assert clases[0]["student_count"] == 1


def test_asistencia_duplicada_responde_409(cliente, registrar, crear_clase):
    id_clase = crear_clase(registrar("docentes", DOCENTE), DOCENTE)
    token = registrar("estudiantes", ESTUDIANTE)
    _registrar_asistencia(cliente, token, id_clase)
    assert _registrar_asistencia(cliente, token, id_clase).status_code == 409


def test_asistencia_a_clase_inexistente_responde_404(cliente, registrar):
    token = registrar("estudiantes", ESTUDIANTE)
    assert _registrar_asistencia(cliente, token, 999).status_code == 404


def test_un_estudiante_no_puede_registrar_asistencia_por_otro(cliente, registrar, crear_clase):
    id_clase = crear_clase(registrar("docentes", DOCENTE), DOCENTE)
    registrar("estudiantes", ESTUDIANTE)
    token_otro = registrar("estudiantes", OTRO_ESTUDIANTE)
    assert _registrar_asistencia(cliente, token_otro, id_clase, email=ESTUDIANTE).status_code == 403


def test_un_docente_no_puede_ver_la_asistencia_de_una_clase_ajena(cliente, registrar, crear_clase):
    id_clase = crear_clase(registrar("docentes", DOCENTE), DOCENTE)
    token_otro = registrar("docentes", OTRO_DOCENTE)
    # Aunque ponga su propio email en la query, la clase no es suya
    respuesta = cliente.get(
        f"/api/asistencia/consulta?id_clase={id_clase}&email_docente={OTRO_DOCENTE}", headers=auth(token_otro)
    )
    assert respuesta.status_code == 403


def test_historial_del_estudiante_ordenado_de_mas_reciente_a_mas_antigua(cliente, registrar, crear_clase):
    token_docente = registrar("docentes", DOCENTE, nombre="Ana", apellido="Ruiz")
    antigua = crear_clase(token_docente, DOCENTE, materia="Antigua", horario="2026-09-01T08:00:00")
    reciente = crear_clase(token_docente, DOCENTE, materia="Reciente", horario="2026-10-01T08:00:00")
    crear_clase(token_docente, DOCENTE, materia="Sin asistir", horario="2026-10-02T08:00:00")
    token = registrar("estudiantes", ESTUDIANTE)
    _registrar_asistencia(cliente, token, antigua)
    _registrar_asistencia(cliente, token, reciente)

    historial = cliente.get(f"/api/asistencia/historial?email_estudiante={ESTUDIANTE}", headers=auth(token))
    assert historial.status_code == 200
    assert historial.json() == [
        {"id": reciente, "materia": "Reciente", "horario": "2026-10-01T08:00:00", "docente": "Ana Ruiz"},
        {"id": antigua, "materia": "Antigua", "horario": "2026-09-01T08:00:00", "docente": "Ana Ruiz"},
    ]


def test_historial_vacio(cliente, registrar):
    token = registrar("estudiantes", ESTUDIANTE)
    assert cliente.get(f"/api/asistencia/historial?email_estudiante={ESTUDIANTE}", headers=auth(token)).json() == []


def test_un_estudiante_no_puede_ver_el_historial_de_otro(cliente, registrar):
    registrar("estudiantes", ESTUDIANTE)
    token_otro = registrar("estudiantes", OTRO_ESTUDIANTE)
    respuesta = cliente.get(f"/api/asistencia/historial?email_estudiante={ESTUDIANTE}", headers=auth(token_otro))
    assert respuesta.status_code == 403
