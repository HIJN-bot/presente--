# 📋 Presente

Sistema de registro de asistencia mediante códigos QR para docentes y estudiantes.

## ¿Qué hace?

El docente crea una clase y genera un QR. Los estudiantes lo escanean para registrar su asistencia. El docente consulta la lista en tiempo real desde su panel.

## 🛠️ Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Base de datos**: PostgreSQL
- **Deploy**: Render.com

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [docs/deployment.md](docs/deployment.md) | 🚀 Cómo está desplegado en Render y cómo hacer redeploy |
| [docs/arquitectura.md](docs/arquitectura.md) | 🏗️ Estructura del proyecto, modelo de datos y flujo principal |
| [docs/api.md](docs/api.md) | 🔌 Referencia de todos los endpoints |
| [docs/notas-tecnicas.md](docs/notas-tecnicas.md) | 🗒️ Deuda técnica y próximos pasos |

## 💻 Desarrollo local

```bash
# Backend
cd back
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd front
npm install
npm run dev
```

La documentación interactiva de la API queda disponible en `http://localhost:8000/docs`.
