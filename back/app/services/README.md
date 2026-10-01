# 🧠 app/services/

Lógica de negocio separada de los routers. Los routers llaman a los services para operaciones que van más allá de una simple consulta a la BD.

## 📄 Archivos

### `clases/manager_clases.py` — `ManagerClases`

Gestiona operaciones sobre clases y su relación con estudiantes.

**Métodos:**
- `registrar_estudiante(clase, estudiante)` — añade un estudiante a la lista de la clase (opera sobre el objeto ORM, no hace commit)
- `consultar_estudiantes(clase_id, estudiante_id, db)` — verifica si un estudiante asistió a una clase, retorna `bool`

### `qr/manager_qr.py` — `ManagerQr`

Genera los códigos QR para las clases.

**Métodos:**
- `generar_url_qr(endpoint)` — construye la URL completa que se codificará en el QR, usando `FRONTEND_BASE_URL` del entorno
- `generar_qr(data)` — genera la imagen QR en formato PNG y la retorna como string base64
- `crear_qr(clase_id, endpoint, expiracion)` — método principal: combina los dos anteriores y retorna un schema `QrCreado`

El QR generado apunta a `{FRONTEND_BASE_URL}/asistencia?clase_id={id}`, que es la página donde el estudiante registra su asistencia.

### `usuarios/auth_service.py` 🔐

Funciones de autenticación:
- `generar_hash(contrasena)` — hashea una contraseña con bcrypt
- `verificar_hash(contrasena, hash_guardado)` — compara contraseña plana contra hash almacenado
- `generar_token(rol, email)` — genera el token de sesión: un JWT firmado con `SECRET_KEY` (HS256) con el email (`sub`), el rol y la expiración (`exp`)
- `decodificar_token(token)` — verifica firma y expiración y retorna el contenido; lanza `jwt.InvalidTokenError` si no es válido

### `usuarios/usuario_actual.py` 🛡️

Dependencias de FastAPI para proteger endpoints:
- `obtener_usuario_actual` — lee `Authorization: Bearer <token>` y retorna `UsuarioActual(email, rol)`; 401 si falta, fue alterado o expiró
- `requerir_docente` / `requerir_estudiante` — además exigen el rol; 403 si no corresponde
- `verificar_propietario(email, usuario)` — 403 si el email de la petición no es el del token

### `usuarios/crear_usuario.py`
Lógica para crear un usuario nuevo (validación + hash + persistencia).

### `usuarios/crear_hash.py`
Utilidad de hash (wrapper de las funciones de `auth_service`).

### `usuarios/validar_email.py`
Valida el formato del email antes de registrar un usuario.

### `usuarios/respuesta_usuario.py`
Construye el payload de respuesta estándar para login y registro.

## 🔗 Dependencias

- `bcrypt` — hash de contraseñas
- `qrcode` + `pillow` — generación de imágenes QR
- `app.schemas` — tipos de retorno
- `app.models` — tipos ORM para type hints
