# 📄 src/pages/

Vistas principales de la aplicación. Cada archivo corresponde a una ruta de react-router-dom.

## 📄 Archivos

### `Inicio.jsx` 🏠
Landing page del sistema. Presenta el producto y sus funcionalidades principales. No requiere autenticación.

### `Login.jsx` 🔐
Formulario de login. Permite elegir entre rol docente y rol estudiante. Llama a `/api/docentes/login` o `/api/estudiantes/login` según el rol seleccionado. Guarda el usuario en el estado local o localStorage.

### `Registro.jsx` 📝
Formulario de registro. Permite crear cuenta como docente o como estudiante. Llama a `/api/docentes/registro` o `/api/estudiantes/registro`.

### `PanelDocente.jsx` 🎓
Panel principal del docente. Tiene tres vistas internas controladas por `activeView`:

- **`clases`** — lista las clases del docente con QR y botón de eliminar
- **`asistencia`** — muestra la lista de estudiantes que asistieron a una clase seleccionada
- **`crear`** — formulario para crear una nueva clase (materia + horario)

Endpoints que consume:
- `GET /api/clases/consultar?email_docente=...`
- `POST /api/clases/creacion`
- `DELETE /api/clases/eliminar?clase_id=...`
- `GET /api/asistencia/consultar?id_clase=...&email_docente=...`

### `PanelEstudiante.jsx` 🎒
Panel del estudiante con historial de asistencia en sus clases.

### `Asistencia.jsx` ✅
Página destino del QR. Lee `?clase_id=X` de la URL y registra automáticamente la asistencia del estudiante autenticado llamando a `POST /api/asistencia/registro`.

## 🔗 Dependencias

- `react-router-dom` — `useNavigate`, `useSearchParams` para leer query params del QR
- `src/config.js` — URL base del backend
