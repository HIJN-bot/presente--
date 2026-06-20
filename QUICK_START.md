# ⚡ Quick Start - Deploy en 5 Minutos

## 🔥 Opción 1: Local (Tu Computadora)

### ✅ Windows (PowerShell)
```powershell
# 1. Abre PowerShell como Admin

# 2. Descarga Docker Desktop
# https://www.docker.com/products/docker-desktop
# Instala y reinicia

# 3. Navega a la carpeta del proyecto
cd C:\Users\tu_usuario\Projects\WebProjects\presente

# 4. Ejecuta el script de deploy
.\deploy.ps1

# Selecciona opción "3" (Compilar e iniciar)

# ✨ ¡Listo! Abre http://localhost en tu navegador
```

### ✅ Linux/Mac (Terminal)
```bash
# 1. Instala Docker
curl -fsSL https://get.docker.com | sh

# 2. Navega a la carpeta del proyecto
cd ~/Projects/WebProjects/presente

# 3. Dale permisos al script
chmod +x deploy.sh

# 4. Ejecuta el script
./deploy.sh

# Selecciona opción "3"

# ✨ ¡Listo! Abre http://localhost en tu navegador
```

---

## 🌐 Opción 2: Nube (Railway - Recomendado)

### 1️⃣ Preparar GitHub
```bash
# Asegúrate que el repo esté en GitHub
git remote -v
# Debería mostrar algo como:
# origin  https://github.com/tu_usuario/presente.git

# Si no, agregar:
# git remote add origin https://github.com/tu_usuario/presente.git
# git push -u origin main
```

### 2️⃣ Desplegar en Railway

1. Abre https://railway.app
2. Haz click en "Start New Project"
3. Selecciona "Import from GitHub"
4. Busca y selecciona "presente"
5. **Railway detecta automáticamente docker-compose.yml**
6. Espera a que termine de compilar (2-3 minutos)
7. ✨ ¡Tu app está en internet!

### 3️⃣ Acceder
```
Frontend:  https://presente-production.railway.app
Backend:   https://presente-production.railway.app/api
Docs:      https://presente-production.railway.app/api/docs
```

---

## 📱 Acceso Después del Deploy

### Local (http://localhost)
```
🌐 Frontend:    http://localhost
🔌 Backend:     http://localhost:8000
📚 API Docs:    http://localhost:8000/docs
```

### Railway (https://tu-app.railway.app)
```
🌐 Frontend:    https://tu-app.railway.app
🔌 Backend:     https://tu-app.railway.app/api
📚 API Docs:    https://tu-app.railway.app/api/docs
```

---

## 🎯 URLs Útiles de la App

```
✅ Inicio:           /
✅ Registro:         /pages/register.html
✅ Login:            /pages/login.html
✅ Panel Docente:    /pages/teacher.html
✅ Panel Estudiante: /pages/student.html
✅ API Docs:         /docs (solo backend)
```

---

## ⚙️ Cambiar Puertos (Si 80/8000 están ocupados)

### Local
```bash
# Edita .env
# Cambia:
BACKEND_PORT=9000   # en lugar de 8000
FRONTEND_PORT=8080  # en lugar de 80

# Luego:
docker-compose up -d

# Accede a:
# http://localhost:8080 (frontend)
# http://localhost:9000 (backend)
```

---

## 🛑 Detener Servicios

```bash
# Local
docker-compose down      # Mantiene la BD

docker-compose down -v   # Elimina TODO (⚠️ Cuidado!)

# Reiniciar
docker-compose restart
```

---

## 📊 Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo BD
docker-compose logs -f postgres
```

---

## 🐛 Troubleshooting Rápido

### "Puerto 80 ya está en uso"
```bash
# Solución:
# 1. Edita .env: FRONTEND_PORT=8080
# 2. docker-compose up -d
# 3. Abre http://localhost:8080
```

### "Cannot connect to backend"
```bash
# Solución:
# 1. Verifica que backend está corriendo:
docker-compose ps

# 2. Si postgres no está "healthy":
docker-compose logs postgres

# 3. Reinicia todo:
docker-compose restart
```

### "Base de datos no existe"
```bash
# Solución:
docker-compose down -v
docker-compose up -d
# Espera 30 segundos a que postgres se inicialice
```

---

## ✅ Checklist Rápido

- [ ] Docker instalado (`docker --version`)
- [ ] `.env` creado (auto si no existe)
- [ ] Servicios corriendo (`docker-compose ps`)
- [ ] Frontend abierto (http://localhost)
- [ ] Backend respondiendo (curl http://localhost:8000/)
- [ ] Puedo loguearme (email test: test@ejemplo.com)

---

## 🚀 Próximos Pasos

1. **Probar funcionalidad completa**
   - [ ] Registro de docente
   - [ ] Registro de estudiante
   - [ ] Login
   - [ ] Crear clase
   - [ ] Generar QR
   - [ ] Registrar asistencia

2. **Configurar dominio personalizado** (si estás en Railway)
   - [ ] Agregar DNS
   - [ ] Habilitar SSL

3. **Backups automáticos**
   - [ ] Configurar backup diario de BD
   - [ ] Guardar en nube (S3, Drive, etc.)

4. **Monitoreo**
   - [ ] Ver logs regularmente
   - [ ] Alertas de errores

---

## 📞 Soporte Rápido

| Problema | Solución |
|---------|----------|
| No abre la app | Espera 30 segundos, postgres se está inicializando |
| Error de conexión BD | `docker-compose logs postgres` |
| Frontend muestra error | `docker-compose logs frontend` |
| API no responde | `docker-compose logs backend` |
| Puerto ocupado | Cambia en .env: `BACKEND_PORT=9000` |
| Todo roto | `docker-compose down -v` y empieza de nuevo |

---

## 📚 Documentación Completa

- **Deployment detallado**: [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **Comparativa plataformas**: [`DEPLOYMENT_PLATFORMS.md`](DEPLOYMENT_PLATFORMS.md)
- **Este documento**: `QUICK_START.md`

---

**⏱️ Tiempo estimado: 5-10 minutos**  
**Última actualización: 2026-06-20**

Happy Deployment! 🎉
