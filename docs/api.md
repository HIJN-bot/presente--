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

---

## Health check
```
GET /
```
**Respuesta:**
```json
{ "message": "FastAPI funcionando" }
```
