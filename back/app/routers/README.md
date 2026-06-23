# 🛣️ app/routers/

Endpoints de la API agrupados por dominio. Cada archivo define un `APIRouter` que se monta en `main.py` bajo el prefijo `/api`.

## 📁 Estructura

```
routers/
├── clases/
│   ├── creacion.py    POST   /api/clases/creacion
│   ├── consultar.py   GET    /api/clases/consultar
│   └── eliminar.py    DELETE /api/clases/eliminar
├── docentes/
│   ├── registro.py    POST   /api/docentes/registro
│   └── login.py       POST   /api/docentes/login
├── estudiantes/
│   ├── registro.py    POST   /api/estudiantes/registro
│   └── login.py       POST   /api/estudiantes/login
├── asistencias/
│   ├── registrar.py   POST   /api/asistencia/registro
│   └── consultar.py   GET    /api/asistencia/consultar
└── qr/
    └── enviar.py      GET    /api/qr/enviar
```

## 🔌 Endpoints

### 📚 Clases

**`POST /api/clases/creacion`**
Crea una clase para el docente y genera su QR automáticamente. El QR codifica la URL del frontend que el estudiante usará para registrar asistencia.
- Query param: `email_docente`
- Body: `ClaseCreada` (`materia`, `horario`)

**`GET /api/clases/consultar`**
Devuelve todas las clases de un docente con su lista de estudiantes y el QR.
- Query param: `email_docente`

**`DELETE /api/clases/eliminar`**
Elimina una clase y sus registros de asistencia (cascade).
- Query param: `clase_id`

### 👥 Docentes y Estudiantes

**`POST /api/docentes/registro`** / **`POST /api/estudiantes/registro`**
Registra un nuevo usuario. La contraseña se hashea con bcrypt antes de guardar.

**`POST /api/docentes/login`** / **`POST /api/estudiantes/login`**
Verifica credenciales y devuelve un token de sesión opaco.

### 📝 Asistencia

**`POST /api/asistencia/registro`**
Registra la asistencia de un estudiante en una clase. Valida que la clase exista, que el estudiante exista y que no haya registrado asistencia previamente en esa clase.
- Body: `InputAsistencia` (`id_clase`, `email_estudiante`)

**`GET /api/asistencia/consultar`**
Devuelve la lista de estudiantes que asistieron a una clase. Solo el docente dueño puede consultarla.
- Query params: `id_clase`, `email_docente`

### 🔲 QR

**`GET /api/qr/enviar`**
Devuelve el QR en base64 de una clase específica.
- Query param: `clase_id`

## 🔗 Dependencias

- `fastapi` — `APIRouter`, `HTTPException`, `Depends`
- `app.database` — `get_db` para inyección de sesión
- `app.models` — modelos ORM para consultas
- `app.schemas` — validación de entrada y salida
- `app.services` — lógica de negocio (clases, QR, usuarios)
