# Arquitectura — Presente

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Base de datos | PostgreSQL |
| ORM | SQLAlchemy + Alembic (migraciones) |
| Deploy | Render.com |

---

## Estructura del proyecto

```
presente/
├── back/                        # Backend FastAPI
│   ├── app/
│   │   ├── main.py              # Entry point, registro de routers y CORS
│   │   ├── database.py          # Conexión SQLAlchemy y Base
│   │   ├── config.py            # Variables de entorno
│   │   ├── models/              # Modelos ORM (tablas)
│   │   │   ├── clases/
│   │   │   │   └── clase_model.py
│   │   │   ├── usuarios/
│   │   │   │   ├── docente_model.py
│   │   │   │   ├── estudiante_model.py
│   │   │   │   └── usuario_model.py
│   │   │   └── tablas/
│   │   │       └── asistencia_clase_estudiante.py  # Tabla puente many-to-many
│   │   ├── schemas/             # Pydantic schemas (validación entrada/salida)
│   │   │   ├── clases/
│   │   │   ├── asistencia/
│   │   │   └── usuarios/
│   │   ├── routers/             # Endpoints agrupados por dominio
│   │   │   ├── clases/
│   │   │   │   ├── creacion.py
│   │   │   │   ├── consultar.py
│   │   │   │   └── eliminar.py
│   │   │   ├── docentes/
│   │   │   │   ├── registro.py
│   │   │   │   └── login.py
│   │   │   ├── estudiantes/
│   │   │   │   ├── registro.py
│   │   │   │   └── login.py
│   │   │   ├── asistencias/
│   │   │   │   ├── registrar.py
│   │   │   │   └── consultar.py
│   │   │   └── qr/
│   │   │       └── enviar.py
│   │   └── services/            # Lógica de negocio
│   │       ├── clases/
│   │       ├── qr/
│   │       └── usuarios/
│   ├── alembic/                 # Migraciones de BD
│   ├── requirements.txt
│   └── Dockerfile.backend
│
├── front/                       # Frontend React
│   ├── src/
│   │   ├── pages/               # Vistas principales
│   │   │   ├── Inicio.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Registro.jsx
│   │   │   ├── PanelDocente.jsx
│   │   │   ├── PanelEstudiante.jsx
│   │   │   └── Asistencia.jsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── config.js            # URL del backend (inyectada en build)
│   │   └── App.jsx
│   └── Dockerfile.frontend
│
├── docs/                        # Documentación
├── docker-compose.yml           # Para desarrollo local con Docker
├── nginx.conf                   # Config del servidor estático (frontend)
└── .env.example                 # Variables de entorno de referencia
```

---

## Modelo de datos

```
docentes ──────────────────────────────┐
  id, nombre, email, password          │
                                       │ docente_id (FK)
clase ──────────────────────────────── ┘
  id, materia, horario, qr, docente_id
       │
       │ many-to-many
       ▼
asistencia_clase_estudiante
  clase_id (FK) + estudiante_id (FK)
       │
       ▼
estudiantes
  id, nombre, email, password
```

La relación entre `clase` y `estudiantes` es many-to-many a través de la tabla puente `asistencia_clase_estudiante`. SQLAlchemy gestiona el cascade: al eliminar una clase, se eliminan automáticamente sus registros de asistencia.

---

## Flujo principal

1. **Docente** se registra y crea una clase → el backend genera un QR con la URL de registro de asistencia
2. **Estudiante** escanea el QR → llega a `/asistencia?clase_id=X` → el frontend registra su asistencia vía API
3. **Docente** consulta la lista de asistencia de su clase desde el panel

---

## CORS

El backend permite peticiones desde:
- `localhost` y `127.0.0.1` en cualquier puerto (desarrollo)
- `*.onrender.com` (producción en Render)

Configurado en `back/app/main.py` con `allow_origin_regex`.
