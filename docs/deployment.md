# Deployment — Presente en Render

El proyecto está desplegado en [Render.com](https://render.com) con dos servicios separados, **ambos con Docker**. La base de datos es PostgreSQL gestionada por Render.

---

## Servicios en Render

| Servicio | Tipo | Dockerfile | URL |
|---------|------|-----------|-----|
| Backend | Web Service (Docker) | `Dockerfile.backend` | `https://presente-backend-<sufijo>.onrender.com` |
| Frontend | Web Service (Docker) | `Dockerfile.frontend` | `https://presente-frontend-<sufijo>.onrender.com` |
| Base de datos | PostgreSQL | — | Interna a Render |

> El frontend **no** es un Static Site: se sirve con nginx dentro de un contenedor,
> y `front/entrypoint.sh` genera `config.json` en el arranque. Puedes comprobarlo
> pidiendo `https://<frontend>/config.json`: devuelve JSON, no HTML.

---

## Cómo llegan las variables de entorno

Render **no crea un archivo `.env`**. Inyecta las variables directamente en el entorno
del proceso del contenedor. Por eso el código funciona igual en local y en Render:

- En local, `load_dotenv()` (en `back/app/config.py`) lee el `.env` y lo vuelca al entorno.
- En Render no hay `.env`; `load_dotenv()` no encuentra nada y no falla. Las variables
  ya están en el entorno, y `os.getenv()` las lee igual.

Si prefieres un archivo real, Render ofrece **Secret Files** (Environment → Secret Files),
que sí escribe un `.env` en disco. No hace falta para este proyecto.

---

## Variables requeridas

### Backend (Web Service)

| Variable | Valor | Si falta |
|---|---|---|
| `DATABASE_URL` | La enlaza Render desde la base de datos | **No arranca** |
| `FRONTEND_BASE_URL` | `https://presente-frontend-<sufijo>.onrender.com` | **No arranca** |
| `ALLOWED_ORIGIN_REGEX` | `https?://.*\.onrender\.com` | Arranca, pero **el CORS bloquea al frontend** |
| `ALLOWED_ORIGINS` | (opcional) orígenes exactos separados por comas | Usa los de localhost |
| `ENV` | `production` | Asume `development` |

`DATABASE_URL` y `FRONTEND_BASE_URL` son obligatorias a propósito: `app/config.py` aborta
el arranque con un mensaje explícito si faltan, en lugar de apuntar en silencio al
sitio equivocado.

### Frontend (Web Service)

| Variable | Valor | Si falta |
|---|---|---|
| `BACKEND_URL` | `https://presente-backend-<sufijo>.onrender.com` | **No arranca** |

`entrypoint.sh` la exige. Antes tenía una URL por defecto escrita en el script, lo que
hacía que un frontend mal configurado apuntara silenciosamente al backend equivocado.

> `VITE_API_BASE_URL` solo aplica al desarrollo local con Vite (`front/.env.local`).
> En producción **no se usa**: la URL llega en runtime por `config.json`, que tiene
> prioridad sobre cualquier valor horneado en el bundle.

---

## Configuración de los servicios

### Backend
- **Environment**: Docker
- **Dockerfile Path**: `Dockerfile.backend`
- **Puerto**: `8000`
- **Health check**: `GET /`

### Frontend
- **Environment**: Docker
- **Dockerfile Path**: `Dockerfile.frontend`
- **Puerto**: `80`

---

## Migraciones de base de datos

`back/entrypoint.sh` ejecuta `alembic upgrade head` en cada arranque del backend, así que
normalmente no hay que hacer nada. Para revisar el estado desde la Shell del backend:

```bash
alembic current
```

---

## Redeploy manual

Render redespliega automáticamente cuando hay un push a `main`. Para forzarlo:

1. Abre el servicio en Render
2. **Manual Deploy** → **Deploy latest commit**

Tras cambiar una variable de entorno hay que redesplegar para que tome efecto.

---

## Troubleshooting

**El contenedor arranca y se cae en bucle**
- Revisa los logs. Si ves `Falta la variable de entorno obligatoria 'X'`, define `X`
  en el servicio y redespliega. Es el fail-fast de `app/config.py`.
- En el frontend, `ERROR: la variable de entorno BACKEND_URL no esta definida` es lo mismo.

**El frontend carga pero no conecta al backend**
- Pide `https://<frontend>/config.json` y verifica que `API_BASE_URL` sea la URL real
  del backend. Ese archivo lo genera `entrypoint.sh` desde `BACKEND_URL`.

**Error de CORS en la consola del navegador**
- Falta `ALLOWED_ORIGIN_REGEX` en el backend. Sin ella solo se aceptan orígenes de
  localhost y el navegador bloquea las peticiones desde el dominio de Render.

**El backend no responde (timeout, HTTP 000)**
- En el plan gratuito Render suspende los servicios tras ~15 min de inactividad y
  tardan ~50 s en despertar. Si tras un par de minutos sigue sin responder, revisa
  en el dashboard que el servicio siga existiendo y no haya fallado el último deploy.

**La BD no tiene las tablas**
- Ejecuta `alembic upgrade head` desde la Shell del backend.
