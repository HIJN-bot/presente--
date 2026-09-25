# 🗄️ app/models/

Modelos ORM de SQLAlchemy. Cada archivo representa una tabla en la base de datos y hereda de `Base` (definida en `database.py`).

## 📄 Archivos

### `clases/clase_model.py`
Tabla `clase`. Almacena las clases creadas por los docentes.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | Integer PK | Identificador único |
| `materia` | String | Nombre de la materia |
| `horario` | DateTime | Fecha y hora de la clase |
| `docente_id` | Integer FK → `docentes.id` | Docente que creó la clase |
| `qr` | Text | Imagen QR en base64 |

Relaciones:
- `docente` → `Docente` (many-to-one)
- `estudiantes` → `Estudiante` (many-to-many vía `asistencia_clase_estudiante`). Al borrar la clase SQLAlchemy elimina sus filas de asistencia. No lleva `cascade="delete"`, porque en many-to-many borraría también a los estudiantes.

### `notas/nota_model.py`
Tabla `notas`. Notas personales y privadas de cada estudiante.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | Integer PK | Identificador único |
| `contenido` | Text | Texto de la nota |
| `fecha` | DateTime con zona horaria | Fecha de publicación (la asigna la base de datos) |
| `estudiante_id` | Integer FK → `estudiantes.id` | Autor. `ON DELETE CASCADE`: si se borra el estudiante se borran sus notas |

Relación: `estudiante` → `Estudiante` (el estudiante accede a sus notas con `estudiante.notas`).

### `usuarios/docente_model.py`
Tabla `docentes`. Usuarios con rol de docente.

### `usuarios/estudiante_model.py`
Tabla `estudiantes`. Usuarios con rol de estudiante.

### `usuarios/usuario_model.py`
Modelo base compartido entre `Docente` y `Estudiante` (herencia de tablas o campos comunes).

### `tablas/asistencia_clase_estudiante.py`
Tabla puente `asistencia_clase_estudiante`. Relación many-to-many entre `clase` y `estudiantes`.

| Columna | Tipo |
|---------|------|
| `clase_id` | FK → `clase.id` |
| `estudiante_id` | FK → `estudiantes.id` |

Cada fila representa que un estudiante registró asistencia en una clase.

## 🔗 Dependencias

- `sqlalchemy` — ORM
- `app.database` — importa `Base` para que los modelos se registren en el metadata
