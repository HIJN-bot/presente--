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
```

`FRONTEND_BASE_URL` se usa para generar la URL que se codifica en el QR. En producción debe apuntar a la URL del frontend en Render.
