# ✅ app/schemas/

Schemas Pydantic para validación y serialización de datos en los endpoints. Definen qué campos se esperan en la entrada y qué se devuelve en la respuesta.

## 📄 Archivos

### `clases/clase_schema.py`

**`ClaseCreada`** — body de entrada para crear una clase:
```python
materia: str
horario: datetime
```

**`ClaseRespuesta`** — respuesta al consultar clases (extiende `ClaseCreada`):
```python
id: Optional[int]
qr: Optional[str]       # imagen QR en base64
docente_id: int
docente: str
estudiantes: List[EstudianteCreado]
```

### `clases/qr_clase_schema.py`

**`QrCreado`** — datos del QR generado para una clase:
```python
url: str          # URL codificada en el QR
qr_image: str     # imagen PNG en base64
clase_id: int
expiracion: Optional[str]
```

### `asistencia/asistencia_schema.py`

**`InputAsistencia`** — body de entrada para registrar asistencia:
```python
id_clase: int
email_estudiante: str
```

### `usuarios/docente_schema.py`
Schemas para registro y respuesta de docentes.

### `usuarios/estudiante_schema.py`
Schemas para registro y respuesta de estudiantes. `EstudianteCreado` se usa en listas de asistencia de clases.

### `usuarios/usuario_schema.py`
Campos comunes de usuario (base para docente y estudiante).

### `usuarios/respuesta_schema.py`
Schema genérico de respuesta para operaciones de usuario (login, registro).

## 🔗 Dependencias

- `pydantic` — validación y serialización
- Se importan en `routers/` y `services/` para type hints y validación de entrada/salida
