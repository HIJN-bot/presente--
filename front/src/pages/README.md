# 📄 src/pages/

Vistas principales de la aplicación. Cada archivo corresponde a una ruta de react-router-dom.

## 📄 Archivos

### `Inicio.jsx` 🏠
Homepage según el boceto: hero ("Automatiza el proceso de asistencia" + botón Iniciar → `/login`) y la sección
"Con Presente" con tres tarjetas y una ilustración. No requiere autenticación.

### `Login.jsx` 🔐
Formulario de login. Permite elegir entre rol docente y rol estudiante. Llama a `/api/docentes/login` o `/api/estudiantes/login` según el rol seleccionado. Guarda el usuario en el estado local o localStorage.

### `Registro.jsx` 📝
Formulario de registro. Permite crear cuenta como docente o como estudiante. Llama a `/api/docentes/registro` o `/api/estudiantes/registro`.

### `PanelDocente.jsx` 🎓
Panel del docente sobre `PanelLayout` ("Presente docentes"). Tres vistas controladas por `activeView`:

- **`clases`** — tarjetas de clase con **Ver QR** (abre un modal) y **Eliminar**
- **`registro`** — tarjetas con **Asistencia** → lista de estudiantes de la clase (con "← Volver")
- **`crear`** — formulario centrado (nombre de la clase + fecha/hora)

Endpoints que consume:
- `GET /api/clases/consultar?email_docente=...`
- `POST /api/clases/creacion?email_docente=...`
- `DELETE /api/clases/eliminar?clase_id=...`
- `GET /api/asistencia/consulta?id_clase=...&email_docente=...`

### `PanelEstudiante.jsx` 🎒
Panel del estudiante sobre `PanelLayout` ("Presente estudiante"). Dos vistas:

- **`asistencia`** — clases en las que el estudiante registró asistencia
- **`notas`** — formulario "Deja una nota aquí" + notas publicadas

Endpoints que consume (**pendientes de crear en el backend**):
- `GET /api/asistencia/historial?email_estudiante=...` → `[{ id, materia, horario, docente }]`
- `GET /api/notas/consultar?email_estudiante=...` → `[{ id, contenido, fecha }]`
- `POST /api/notas/creacion?email_estudiante=...` con `{ contenido }` → `{ id, contenido, fecha }`

Mientras no existan, el panel muestra el mensaje de error del servidor en lugar de los datos.

### `Asistencia.jsx` ✅
Página destino del QR. Lee `?clase_id=X` de la URL y registra automáticamente la asistencia del estudiante autenticado llamando a `POST /api/asistencia/registro`.

## 🔗 Dependencias

- `react-router-dom` — `useNavigate`, `useSearchParams` para leer query params del QR
- `src/config.js` — URL base del backend
- `src/sesion.js` — usuario guardado y cierre de sesión
- `src/components/` — layouts y componentes de UI compartidos
