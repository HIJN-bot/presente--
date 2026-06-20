# 🚀 Deployment Guide - Proyecto Presente

Guía completa para desplegar el MVP de Presente con Docker.

## 📋 Requisitos Previos

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**

### Instalación de Docker
- **Windows**: [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop)
- **Linux**: 
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```
- **Mac**: [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop)

---

## 🏠 Opción 1: Deployment Local (Desarrollo)

### Paso 1: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores (opcional para desarrollo)
# Los valores por defecto funcionarán
```

### Paso 2: Construir e Iniciar Contenedores

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Paso 3: Verificar que Funciona

```bash
# Ver estado de los contenedores
docker-compose ps

# Probar el backend
curl http://localhost:8000/

# Probar el frontend
curl http://localhost/
```

### Acceso
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Detener Servicios

```bash
# Detener sin eliminar volúmenes
docker-compose down

# Detener y eliminar todo (cuidado!)
docker-compose down -v
```

---

## 🌐 Opción 2: Deployment en la Nube

### Opción 2A: Railway.app (Recomendado - Más Fácil)

1. **Crear cuenta en [Railway.app](https://railway.app)**

2. **Conectar tu repositorio GitHub**
   - Dashboard → New Project → Import from GitHub

3. **Configurar variables de entorno**
   ```
   DATABASE_URL=postgresql://user:pass@host/presente
   API_BASE_URL=https://tu-app.railway.app
   ENV=production
   ```

4. **Railway detectará automáticamente docker-compose.yml**

5. **Desplegar**
   - Click en "Deploy" y esperar

### Opción 2B: Render.com

1. **Crear cuenta en [Render.com](https://render.com)**

2. **New → Web Service**

3. **Conectar GitHub y seleccionar repositorio**

4. **Configuración**
   - Build Command: `docker-compose build`
   - Start Command: `docker-compose up`

5. **Agregar variables de entorno** en la consola

6. **Desplegar**

### Opción 2C: DigitalOcean App Platform

1. **Crear cuenta en [DigitalOcean](https://www.digitalocean.com)**

2. **App Platform → Create App**

3. **Conectar GitHub**

4. **DigitalOcean lee docker-compose.yml automáticamente**

5. **Configurar variables de entorno en la UI**

6. **Desplegar**

### Opción 2D: AWS EC2 (Más Control)

1. **Lanzar instancia EC2**
   ```bash
   # Conectar vía SSH
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

2. **Instalar Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Clonar repositorio**
   ```bash
   git clone https://github.com/tu-usuario/presente.git
   cd presente
   cp .env.example .env
   # Editar .env con valores de producción
   ```

4. **Iniciar con Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Configurar Dominio**
   - Apuntar DNS a la IP pública de la instancia
   - Usar Let's Encrypt para HTTPS (nginx se configura automáticamente)

---

## 🔐 Configuración de Producción

### Variables Críticas de .env

```env
# NUNCA usar contraseñas débiles en producción
DB_PASSWORD=GenerarContraseñaSegura123!@#

# Usar HTTPS en producción
API_BASE_URL=https://tu-dominio.com
VITE_API_BASE_URL=https://tu-dominio.com

# Desactivar debug
ENV=production
```

### CORS para Producción

Si necesitas restringir CORS, editar `back/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tu-dominio.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### HTTPS con Let's Encrypt (nginx)

```bash
# En el servidor, instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com

# Nginx se configura automáticamente (ver docker-compose.yml)
```

---

## 🗄️ Mantenimiento de Base de Datos

### Backup

```bash
# Backup de PostgreSQL
docker-compose exec postgres pg_dump -U postgres presente > backup.sql

# Guardar en lugar seguro
cp backup.sql /path/seguro/
```

### Restaurar

```bash
# Restaurar desde backup
docker-compose exec -T postgres psql -U postgres presente < backup.sql
```

### Migraciones

```bash
# Aplicar migraciones Alembic
docker-compose exec backend alembic upgrade head

# Ver estado
docker-compose exec backend alembic current
```

---

## 📊 Monitoreo y Logs

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo base de datos
docker-compose logs -f postgres
```

### Health Check

```bash
# Ver estado de salud de contenedores
docker-compose ps

# Los contendores con "healthy" están funcionando correctamente
```

---

## ⚠️ Troubleshooting

### El backend no puede conectar a la BD

```bash
# Verificar que postgres está sano
docker-compose ps

# Ver logs de postgres
docker-compose logs postgres

# Reiniciar postgres
docker-compose restart postgres
```

### El frontend no puede conectar al backend

```bash
# Verificar VITE_API_BASE_URL en .env
cat .env | grep VITE_API_BASE_URL

# Ver logs del nginx
docker-compose logs frontend
```

### Puerto ya en uso

```bash
# Cambiar puertos en .env
BACKEND_PORT=9000
FRONTEND_PORT=8080

# Reiniciar
docker-compose up -d
```

### Limpiar todo y empezar de nuevo

```bash
# Eliminar contenedores y volúmenes
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Iniciar de nuevo
docker-compose up -d
```

---

## 🚀 Checklist de Deployment Final

- [ ] Variables de entorno (.env) configuradas correctamente
- [ ] Base de datos creada y accesible
- [ ] Backend corriendo sin errores (curl http://localhost:8000/)
- [ ] Frontend accesible (http://localhost)
- [ ] Endpoints API respondiendo correctamente
- [ ] Certificados SSL/TLS instalados (producción)
- [ ] Respaldos de BD configurados
- [ ] Logs siendo monitoreados
- [ ] Dominio apuntando al servidor correcto
- [ ] Firewall abierto para puertos 80 y 443

---

## 📞 Soporte

Para problemas:
1. Revisar logs: `docker-compose logs -f`
2. Verificar .env está correctamente configurado
3. Asegurar que Docker está corriendo: `docker ps`
4. Reintentar: `docker-compose down -v && docker-compose up -d`

---

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Railway Docs](https://docs.railway.app/)
- [Render.com Docs](https://render.com/docs)

---

**Creado**: 2026-06-20  
**Última actualización**: 2026-06-20
