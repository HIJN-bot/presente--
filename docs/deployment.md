# Deployment — Presente en Render

El proyecto está desplegado en [Render.com](https://render.com) con dos servicios separados: backend (Web Service) y frontend (Static Site). La base de datos es PostgreSQL gestionada por Render.

---

## Servicios en Render

| Servicio | Tipo | URL |
|---------|------|-----|
| Backend | Web Service (Docker) | `https://presente-backend-<sufijo>.onrender.com` |
| Frontend | Static Site | `https://presente-frontend-<sufijo>.onrender.com` |
| Base de datos | PostgreSQL | Interna a Render |

> Los sufijos son aleatorios y los asigna Render. Consulta el dashboard para las URLs exactas.

---

## Variables de entorno requeridas

### Backend (Web Service)
```
DATABASE_URL=postgresql://usuario:password@host/presente
```
Render genera esta variable automáticamente si enlazas la base de datos al servicio.

### Frontend (Static Site)
```
VITE_BACKEND_URL=https://presente-backend-<sufijo>.onrender.com
```
Esta variable se inyecta en build time por Vite. Debe apuntar a la URL exacta del backend.

---

## Configuración del backend en Render

- **Environment**: Docker
- **Dockerfile**: `Dockerfile.backend`
- **Puerto**: `8000`
- **Health check**: `GET /`

El CORS del backend acepta cualquier subdominio de `*.onrender.com`, por lo que no necesitas editar `main.py` al cambiar de URL.

---

## Configuración del frontend en Render

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Root directory**: `front/`

Render ejecuta el build con las variables de entorno configuradas, generando el `dist/` estático con la URL del backend embebida.

---

## Migraciones de base de datos

Las migraciones se manejan con Alembic. Tras un deploy que modifique modelos, ejecuta desde la consola de Render (Shell del backend):

```bash
alembic upgrade head
```

Para ver el estado actual:
```bash
alembic current
```

---

## Redeploy manual

Render redespliega automáticamente cuando hay un push a `main`. Para forzar un redeploy desde el dashboard:

1. Abre el servicio en Render
2. Click en **Manual Deploy** → **Deploy latest commit**

---

## Troubleshooting

**El frontend no conecta al backend**
- Verifica que `VITE_BACKEND_URL` en el Static Site apunte a la URL correcta del backend
- Haz un redeploy del frontend después de cambiar la variable

**Error 500 en el backend**
- Revisa los logs en Render: servicio → **Logs**
- Verifica que `DATABASE_URL` esté correctamente enlazada

**La BD no tiene las tablas**
- Ejecuta `alembic upgrade head` desde la Shell del backend en Render
