# ⚙️ back/

Backend del sistema Presente. API REST construida con FastAPI y PostgreSQL.

## 📁 Estructura

```
back/
├── app/
│   ├── main.py          # Entry point: instancia FastAPI, registra routers y configura CORS
│   ├── database.py      # Conexión a PostgreSQL, sesiones SQLAlchemy y clase Base
│   ├── config.py        # Variables de entorno
│   ├── models/          # Modelos ORM (tablas de la BD)
│   ├── schemas/         # Schemas Pydantic (validación de entrada/salida)
│   ├── routers/         # Endpoints agrupados por dominio
│   └── services/        # Lógica de negocio
├── alembic/             # Migraciones de base de datos
├── alembic.ini          # Configuración de Alembic
├── requirements.txt     # Dependencias Python
└── entrypoint.sh        # Script de arranque en Docker (corre migraciones antes de uvicorn)
```

## 📦 Dependencias principales

| Paquete | Versión | Para qué se usa |
|---------|---------|-----------------|
| `fastapi` | 0.136.1 | Framework web |
| `uvicorn` | 0.46.0 | Servidor ASGI |
| `sqlalchemy` | 2.0.49 | ORM para la BD |
| `alembic` | 1.18.4 | Migraciones |
| `psycopg2-binary` | 2.9.12 | Driver PostgreSQL |
| `pydantic` | 2.13.3 | Validación de datos |
| `bcrypt` | 5.0.0 | Hash de contraseñas |
| `qrcode` | 8.2 | Generación de QR |
| `pillow` | 12.2.0 | Procesamiento de imágenes (requerido por qrcode) |
| `python-dotenv` | 1.2.2 | Cargar variables del `.env` |

## 🚀 Cómo correr en desarrollo

```bash
# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp ../.env.example .env
# Editar .env con tu DATABASE_URL

# Correr migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload
```

El servidor queda en `http://localhost:8000`. La documentación interactiva de la API en `http://localhost:8000/docs`.

## 🔑 Variables de entorno requeridas

```
DATABASE_URL=postgresql://usuario:password@localhost:5432/presente
FRONTEND_BASE_URL=http://localhost:5173
SECRET_KEY=<clave aleatoria: python -c "import secrets; print(secrets.token_urlsafe(48))">
```

`FRONTEND_BASE_URL` se usa para generar la URL que se codifica en el QR. En producción debe apuntar a la URL del frontend en Render.
`SECRET_KEY` firma los tokens de sesión (JWT); nunca la subas al repositorio.

## 🧪 Pruebas

```bash
pip install -r requirements-dev.txt   # pytest y httpx (solo desarrollo)
pytest                                 # todas
pytest tests/unit                      # unitarias (sin base de datos)
pytest tests/integracion               # integración: API real contra PostgreSQL
```

- Las pruebas de integración usan una base **separada**: `TEST_DATABASE_URL` si está definida
  o, si no, la de `DATABASE_URL` con el nombre `<nombre>_test` (se crea sola). Por seguridad
  se niegan a correr si el nombre no termina en `_test`.
- Al empezar ejecutan todas las migraciones hacia abajo y hacia arriba, y vacían las tablas
  antes de cada prueba.
- Usan una `SECRET_KEY` aleatoria generada en cada ejecución.
- `tests/servidor_e2e.py` levanta la API contra esa misma base en el puerto 8001 para las
  pruebas end-to-end del frontend (ver `front/README.md`).
