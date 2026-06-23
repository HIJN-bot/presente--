# 🌐 front/

Frontend del sistema Presente. SPA construida con React y Vite, con estilos en Tailwind CSS.

## 📁 Estructura

```
front/
├── src/
│   ├── App.jsx              # Configuración de rutas (react-router-dom)
│   ├── main.jsx             # Entry point de React
│   ├── config.js            # URL del backend (leída desde window.API_BASE_URL)
│   ├── pages/               # Vistas principales
│   │   ├── Inicio.jsx       # Landing page
│   │   ├── Login.jsx        # Login de docente y estudiante
│   │   ├── Registro.jsx     # Registro de usuarios
│   │   ├── PanelDocente.jsx # Panel con clases, QR, asistencia y crear clase
│   │   ├── PanelEstudiante.jsx # Panel del estudiante con historial
│   │   └── Asistencia.jsx   # Página de registro de asistencia vía QR
│   ├── components/          # Componentes reutilizables
│   ├── hooks/               # Custom hooks
│   └── utils/               # Funciones de utilidad
├── index.html               # HTML base (inyecta window.API_BASE_URL en runtime)
├── vite.config.js           # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind
└── package.json
```

## 📦 Dependencias principales

| Paquete | Para qué se usa |
|---------|-----------------|
| `react` 19 | Framework de UI |
| `react-dom` 19 | Renderizado en el DOM |
| `react-router-dom` 7 | Navegación entre páginas |
| `tailwindcss` 4 | Estilos utilitarios |
| `vite` 8 | Bundler y servidor de desarrollo |

## 🚀 Cómo correr en desarrollo

```bash
npm install
npm run dev
```

El servidor queda en `http://localhost:5173`. El frontend espera que el backend esté corriendo en `http://localhost:8000`.

## 🔑 Cómo funciona la URL del backend

`src/config.js` lee `window.API_BASE_URL`. Ese valor se inyecta en `index.html` antes de servir la página.

- **Desarrollo**: por defecto cae a `http://localhost:8000`
- **Producción (Render)**: Render inyecta la variable `VITE_BACKEND_URL` en build time

## 🗺️ Páginas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `Inicio.jsx` | Landing page con descripción del sistema |
| `/login` | `Login.jsx` | Login de docente y estudiante |
| `/registro` | `Registro.jsx` | Registro de nuevos usuarios |
| `/panel-docente` | `PanelDocente.jsx` | Panel principal del docente |
| `/panel-estudiante` | `PanelEstudiante.jsx` | Panel del estudiante |
| `/asistencia` | `Asistencia.jsx` | Registro de asistencia (destino del QR) |

## 🛠️ Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Build de producción → genera dist/
npm run preview  # Preview del build de producción
npm run lint     # ESLint
```
