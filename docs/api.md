# API Reference — Presente

Base URL: `https://presente-backend-<sufijo>.onrender.com/api`  
Documentación interactiva: `<base-url>/docs` (generada automáticamente por FastAPI)

---

## Estudiantes

### Registro
```
POST /api/estudiantes/registro
```
**Body:**
```json
{
  "nombre": "string",
  "email": "string",
  "password": "string"
}
```

### Login
```
POST /api/estudiantes/login
```
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

---

## Docentes

### Registro
```
POST /api/docentes/registro
```
**Body:**
```json
{
  "nombre": "string",
  "email": "string",
  "password": "string"
}
```

### Login
```
POST /api/docentes/login
```
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

---

## Clases

### Crear clase
```
POST /api/clases/creacion
```

### Consultar clases del docente
```
GET /api/clases/consultar?email_docente=<email>
```

### Eliminar clase
```
DELETE /api/clases/eliminar?clase_id=<id>
```
Elimina la clase y todos sus registros de asistencia asociados.

**Respuesta 200:**
```json
{ "detail": "Clase eliminada correctamente" }
```

**Respuesta 404:**
```json
{ "detail": "La clase que intenta borrar no existe" }
```

---

## QR

### Obtener QR de una clase
```
GET /api/qr/enviar?clase_id=<id>
```
Retorna la imagen QR en base64. El QR codifica la URL de registro de asistencia para esa clase.

---

## Asistencia

### Registrar asistencia
```
POST /api/asistencias/registrar
```
**Body:**
```json
{
  "id_clase": "integer",
  "email_estudiante": "string"
}
```

### Consultar asistencia de una clase
```
GET /api/asistencias/consultar?id_clase=<id>&email_docente=<email>
```
Retorna la lista de estudiantes que registraron asistencia en la clase.

### Historial de asistencia del estudiante
```
GET /api/asistencia/historial?email_estudiante=<email>
```
Retorna las clases en las que el estudiante registró asistencia, de la más reciente a la más antigua.

**Respuesta:**
```json
[{ "id": 1, "materia": "string", "horario": "datetime", "docente": "string" }]
```

---

## Notas del estudiante

Notas personales y privadas: solo se consultan con el email de su autor.

### Crear nota
```
POST /api/notas/creacion?email_estudiante=<email>
```
**Body:**
```json
{ "contenido": "string (1 a 500 caracteres, sin espacios en los extremos)" }
```
**Respuesta (201):**
```json
{ "id": 1, "contenido": "string", "fecha": "datetime con zona horaria" }
```

### Consultar notas
```
GET /api/notas/consultar?email_estudiante=<email>
```
Retorna las notas del estudiante, de la más reciente a la más antigua, con el mismo formato que la creación.

---

## Health check
```
GET /
```
**Respuesta:**
```json
{ "message": "FastAPI funcionando" }
```
