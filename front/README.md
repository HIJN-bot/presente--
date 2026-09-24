# 🌐 front/

Frontend del sistema Presente. SPA construida con React y Vite, con estilos en Tailwind CSS.

## 📁 Estructura

```
front/
├── public/
│   └── favicon.svg
├── designs/                 # Bocetos a mano de la UI (guía de diseño)
├── src/
│   ├── App.jsx              # Configuración de rutas (react-router-dom)
│   ├── main.jsx             # Entry point de React
│   ├── index.css            # Tailwind, tokens de color y modo oscuro
│   ├── config.js            # URL del backend
│   ├── errores.js           # Traduce los errores del backend a mensajes legibles
│   ├── sesion.js            # Leer usuario / cerrar sesión (sin borrar preferencias)
│   ├── pages/               # Vistas principales (ver pages/README.md)
│   ├── hooks/
│   │   ├── useTema.js       # Tema claro/oscuro persistido en localStorage['tema']
│   │   └── useMediaQuery.js # Saber si se cumple una media query (p. ej. escritorio)
│   └── components/          # Componentes reutilizables
│       ├── Header.jsx       # Hamburguesa + título centrado + BotonTema
│       ├── BotonTema.jsx    # Botón luna/sol
│       ├── MenuLateral.jsx  # Panel deslizable que abre la hamburguesa
│       ├── PaginaPublica.jsx# Layout de inicio, login, registro y asistencia
│       ├── PanelLayout.jsx  # Layout de los paneles: Header + sidebar + contenido
│       ├── Boton.jsx        # Botón redondeado (primario, secundario, peligro); con "to" es un Link
│       ├── Tarjeta.jsx      # Caja redondeada con borde
│       ├── TarjetaClase.jsx # Tarjeta de clase (materia, fecha, detalle, acciones)
│       ├── TituloSeccion.jsx# Título con la línea punteada de los bocetos
│       ├── CampoTexto.jsx   # Input/textarea con etiqueta asociada
│       ├── SelectorRol.jsx  # Estudiante / Docente en login y registro
│       ├── Aviso.jsx        # Mensaje de error o éxito
│       ├── Modal.jsx        # Ventana modal (<dialog>), usada para ver el QR
│       └── ilustraciones/   # SVG inline de la homepage
├── index.html               # HTML base: fuentes, script anti-parpadeo del tema y config de runtime
└── vite.config.js
```

## 🎨 Estilos y tema

- Tailwind 4 se configura en `src/index.css` (`tailwind.config.js` no se usa).
- Los colores son **tokens semánticos** (`bg-fondo`, `bg-superficie`, `text-texto`, `text-texto-suave`,
  `border-borde`, `bg-acento`, `text-peligro`...). Sus valores están en `:root` (claro) y `.dark` (oscuro)
  dentro de `index.css`: para cambiar la paleta solo se editan esas variables.
- El modo oscuro se activa con la clase `.dark` en `<html>`. La primera vez sigue la preferencia del
  sistema; después, la elección del usuario (`localStorage['tema']`).
- Responsivo: en móvil la sidebar de los paneles se abre con la hamburguesa; desde `lg` (1024 px) es fija
  y la hamburguesa la oculta o muestra.

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
| `/` | `Inicio.jsx` | Homepage: hero y sección "Con Presente" |
| `/login` | `Login.jsx` | Login de docente y estudiante |
| `/registro` | `Registro.jsx` | Registro de nuevos usuarios |
| `/docente` | `PanelDocente.jsx` | Panel del docente |
| `/estudiante` | `PanelEstudiante.jsx` | Panel del estudiante |
| `/asistencia` | `Asistencia.jsx` | Registro de asistencia (destino del QR) |

## 🛠️ Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Build de producción → genera dist/
npm run preview  # Preview del build de producción
npm run lint     # ESLint
```
