# 🗃️ alembic/

Migraciones de base de datos gestionadas con Alembic. Cada migración es un script que describe un cambio en el esquema de la BD.

## 📄 Archivos

### `env.py`
Configuración de Alembic: conecta con la BD usando `DATABASE_URL` del entorno y registra los modelos SQLAlchemy para que Alembic pueda detectar cambios automáticamente.

### `script.py.mako`
Template que Alembic usa para generar nuevos archivos de migración.

### `versions/` 📂
Migraciones en orden cronológico:

| Archivo | Descripción |
|---------|-------------|
| `d807188d162e_crear_tabla_de_las_clases.py` | Crea la tabla `clase` |
| `d05c87c4a754_implementar_tablas_estudiantes_y_.py` | Crea tablas `estudiantes`, `docentes` y la tabla puente `asistencia_clase_estudiante` |

## ⚡ Comandos útiles

```bash
# Aplicar todas las migraciones pendientes
alembic upgrade head

# Ver la migración actual
alembic current

# Ver el historial de migraciones
alembic history

# Generar una nueva migración automáticamente (detecta cambios en los modelos)
alembic revision --autogenerate -m "descripcion del cambio"

# Revertir la última migración
alembic downgrade -1
```

## ⚠️ Importante

Siempre correr `alembic upgrade head` después de un deploy que modifique modelos. El `entrypoint.sh` del backend lo hace automáticamente al arrancar en Docker.
