# Plan de implementación — Refactor del Frontend (nueva UI/UX)

> Guía de diseño obligatoria: los bocetos a mano de `front/designs/`
> (`homepage-presente.jpg`, `docente-page-presente.jpg`, `estudiante-page-presente.jpg`).
> Ante cualquier duda de diseño, manda el boceto sobre este documento.

---

## 0. Análisis del estado actual

### Lo que existe hoy (verificado en el código)

| Pieza | Estado |
|---|---|
| Stack | React 19 + Vite 8 + react-router-dom 7 + Tailwind CSS 4 (vía `@tailwindcss/postcss`) |
| Rutas (`src/App.jsx`) | `/`, `/login`, `/registro`, `/estudiante`, `/docente`, `/asistencia` |
| `Inicio.jsx` | Landing reciente (commits `6d09873`, `8f0cf9c`, `089880b`) con CSS propio en `App.css`: hero, funciones, flujo, roles, tecnología, CTA y footer. **No coincide con el boceto.** |
| `PanelDocente.jsx` | Header + sidebar con 3 vistas (`clases`, `registro`, `crear`) controladas por `activeView`. Tema oscuro fijo (slate/teal). La estructura **ya coincide** con el boceto; cambia la presentación. |
| `PanelEstudiante.jsx` | Solo header y saludo. Sin datos. |
| `Login.jsx`, `Registro.jsx`, `Asistencia.jsx` | Funcionales, tema oscuro slate/teal. **No tienen boceto.** |
| `src/components/`, `src/hooks/` | Mencionados en `front/README.md` pero **no existen**. |
| `front/public/` | No existe (el `favicon.svg` de `index.html` da 404). |
| `tailwind.config.js` | Tailwind 4 lo ignora si no se carga con `@config`; la configuración real vive en CSS. |

### Endpoints disponibles (verificados en `back/app/routers/`)

- `POST /api/docentes/login`, `POST /api/docentes/registro`
- `POST /api/estudiantes/login`, `POST /api/estudiantes/registro`
- `GET /api/clases/consultar`, `POST /api/clases/creacion`, `DELETE /api/clases/eliminar`
- `GET /api/asistencia/consulta` (por clase), `POST /api/asistencia/registro`
- `GET /api/qr`

**No existen** endpoints para: historial de asistencias del estudiante ni notas.
Ambos aparecen en el boceto del estudiante (ver §5, decisiones pendientes).

### Elementos comunes a los tres bocetos

1. **Header**: menú hamburguesa (izquierda), título centrado ("Presente", "Presente docentes", "Presente estudiante"), selector de tema luna/sol (derecha).
2. **Modo claro / oscuro**: el ícono luna/sol aparece en todas las páginas → el tema es una funcionalidad global.
3. **Paneles**: sidebar izquierda con botones redondeados + área principal con tarjetas redondeadas; las secciones se separan con líneas punteadas.

---

## 1. Proceso de implementación

Rama de trabajo: `refactor/front-nueva-ui` (desde `main`). Cada fase termina con
`npm run lint` y `npm run build` en verde antes de hacer commit.

### Fase 0 — Preparación
- Crear la rama.
- Versionar los bocetos (`front/designs/`, hoy sin seguimiento en git) y este plan.

### Fase 1 — Fundamentos de estilo y tema
- `src/index.css`: definir tokens de color con `@theme` (reutilizando la paleta ya
  establecida en `App.css`: `--ink`, `--paper`, `--accent #6d5dfc`, `--soft`, `--muted`, `--line`)
  y sus equivalentes oscuros. Activar la variante oscura por clase:
  `@custom-variant dark (&:where(.dark, .dark *));`
- Mover la carga de fuentes (DM Sans + Space Grotesk) de `App.css` a `index.html`/`index.css`.
- `src/hooks/useTema.js`: lee/guarda `localStorage['tema']`, respeta `prefers-color-scheme`
  la primera vez y aplica la clase `dark` en `<html>`.
- Script mínimo en `index.html` que aplica la clase `dark` antes de renderizar (evita el
  parpadeo de tema claro al recargar).
- **Corrección necesaria**: `PanelDocente` y `PanelEstudiante` usan `localStorage.clear()` al
  cerrar sesión, lo que borraría la preferencia de tema. Reemplazar por la eliminación
  explícita de `token`, `role` y `user`.

### Fase 2 — Componentes compartidos (`src/components/`)
- `Header.jsx`: hamburguesa + título (prop) + `BotonTema`.
- `BotonTema.jsx`: ícono luna/sol en SVG inline (sin dependencias de íconos), con `aria-label`.
- `MenuLateral.jsx`: panel deslizable que abre la hamburguesa (homepage: enlaces; paneles: ver Fase 4).
- `PanelLayout.jsx`: estructura Header + sidebar + contenido, reutilizada por docente y estudiante.
  En escritorio la sidebar es fija (como en el boceto); en móvil se oculta y la hamburguesa la muestra.

### Fase 3 — Homepage (`Inicio.jsx`)
- Reescribir la página siguiendo el boceto (estructura en §2.1, textos en §3).
- Ilustraciones como componentes SVG inline: manos levantadas (hero) y celular escaneando QR (imagen central).
- Eliminar las secciones que no están en el boceto (funciones, flujo, roles, tecnología, CTA, footer)
  y borrar `App.css` junto con su import en `main.jsx`, ya que solo contiene estilos de la landing actual.

### Fase 4 — Panel docente (`PanelDocente.jsx`)
- Migrar a `PanelLayout` con título "Presente docentes".
- Mantener intacta la lógica actual (fetch, estados, `activeView`); solo cambia la presentación.
- Tarjetas de clase: materia + fecha/hora + botón **Ver QR** (el QR se muestra en un modal,
  ya no siempre visible) + acción de eliminar.
- Registro de clases: tarjetas con botón **Asistencia** → lista de estudiantes.
- Crear clase: tarjeta centrada con "Nombre clase", "Hora / día" y botón **Crear**.
- Cerrar sesión: al final de la sidebar (el boceto no lo muestra; ver decisiones).

### Fase 5 — Panel estudiante (`PanelEstudiante.jsx`)
- Migrar a `PanelLayout` con título "Presente estudiante".
- Sidebar: **Asistencia clases** y **Notas**.
- Tarjeta de clase (nombre de la clase + id) y tarjeta "Deja una nota aquí" con botón **Publicar**.
- Los datos dependen de la decisión sobre el backend (§5).

### Fase 6 — Páginas sin boceto (Login, Registro, Asistencia)
- Aplicar el mismo Header, tokens y soporte claro/oscuro.
- Sin cambios de lógica ni de endpoints.

### Fase 7 — Verificación y documentación
- `npm run lint` y `npm run build`.
- Prueba manual en navegador (dev server + backend local): homepage, login docente y estudiante,
  crear clase, ver QR, ver asistencia, eliminar clase, registrar asistencia por QR, cerrar sesión.
- Revisar cada página en claro/oscuro, escritorio y móvil (375 px).
- Actualizar `front/README.md` (estructura real, componentes, tema) y `front/src/pages/README.md`.

---

## 2. Estructura de las páginas

### 2.1 Homepage `/`

```
┌───────────────────────────────────────────────┐
│ ☰              Presente                ☾ / ☀ │  Header
├───────────────────────────────────────────────┤
│                        │  Automatiza el      │
│  [ilustración manos    │  proceso de         │  Hero (2 columnas;
│   levantadas]          │  asistencia         │  en móvil se apilan)
│                        │  [ Iniciar ]        │
│───────────────────────────────────────────────│
│  (elipse)       Con Presente        (elipse)  │  Sección explicativa
│               ┌───────────────┐               │
│               │ texto 1       │               │
│               └───────────────┘               │
│  ┌───────────┐                ┌───────────┐   │
│  │ texto 2   │     [img]      │ texto 3   │   │
│  └───────────┘                └───────────┘   │
└───────────────────────────────────────────────┘
```

- Hamburguesa → menú con "Iniciar sesión" (`/login`) y "Crear cuenta" (`/registro`).
- Botón "Iniciar" → `/login`.
- Elipses: formas decorativas en color `--soft`/acento, sin contenido.
- Móvil: hero en una columna (texto arriba, ilustración abajo); las tres tarjetas se apilan
  con la imagen entre la 1 y las otras dos.

### 2.2 Panel docente `/docente`

```
┌───────────────────────────────────────────────┐
│ ☰          Presente docentes           ☾ / ☀ │
├──────────────┬────────────────────────────────┤
│ (Clases      │ Clases programadas             │
│ programadas) │ ┌──────────────┐               │
│ (Registro    │ │ Clase        │               │
│  clases)     │ │ hora / día   │               │
│ (Crear       │ │ [ Ver QR ]   │               │
│  clase)      │ └──────────────┘               │
│              │ - - - - - - - - - - - - - - -  │
│              │ ┌──────────────┐               │
│              │ │ Clase II     │               │
│              │ │ hora / día   │               │
│              │ │ [Asistencia] │               │
│              │ └──────────────┘               │
│              │ - - - - - - - - - - - - - - -  │
│              │      ┌──────────────────┐      │
│              │      │ [Nombre clase  ] │      │
│              │      │ [Hora / día    ] │      │
│              │      │    [ Crear ]     │      │
│ [Cerrar      │      └──────────────────┘      │
│  sesión]     │                                │
└──────────────┴────────────────────────────────┘
```

- **Clases programadas**: grid de tarjetas (materia, fecha/hora, nº de estudiantes, Ver QR, Eliminar).
- **Registro clases**: tarjetas con botón Asistencia → lista (nombre, apellido, email) con "← Volver".
- **Crear clase**: formulario en tarjeta centrada (`materia` texto, `horario` datetime-local).
- Estados vacíos: "Aún no tienes clases. Crea la primera desde «Crear clase»."

### 2.3 Panel estudiante `/estudiante`

```
┌───────────────────────────────────────────────┐
│ ☰         Presente estudiante          ☾ / ☀ │
├──────────────┬────────────────────────────────┤
│ (Asistencia  │ ┌──────────────┐               │
│  clases)     │ │ Nombre clase │               │
│ (Notas)      │ │ id           │               │
│              │ └──────────────┘               │
│              │ - - - - - - - - - - - - - - -  │
│              │   ┌─────────────────────────┐  │
│              │   │ Deja una nota aquí      │  │
│              │   │       [ Publicar ]      │  │
│ [Cerrar      │   └─────────────────────────┘  │
│  sesión]     │                                │
└──────────────┴────────────────────────────────┘
```

### 2.4 Login, Registro, Asistencia (sin boceto)
Header común (título "Presente", botón de tema, hamburguesa con enlace a inicio) + tarjeta
central redondeada con el formulario/estado actual, con los tokens nuevos.

---

## 3. Contenido (texto) de la homepage

**Header**
- Título: **Presente**
- Menú: Iniciar sesión · Crear cuenta
- Botón de tema (accesible): "Cambiar a modo oscuro" / "Cambiar a modo claro"

**Hero**
- Título: **Automatiza el proceso de asistencia**
- Botón: **Iniciar**
- Texto alternativo de la ilustración: "Estudiantes levantando la mano en clase"

**Sección "Con Presente"**
- Título: **Con Presente**

- Tarjeta 1 (superior) — **Crea tus clases en segundos**
  "Registra la materia y el horario desde tu panel docente. Presente genera un código QR único para cada clase."

- Tarjeta 2 (inferior izquierda) — **Tus estudiantes escanean el QR**
  "Al llegar a clase, cada estudiante escanea el código con su celular y su asistencia queda registrada al instante, sin listas en papel."

- Tarjeta 3 (inferior derecha) — **Consulta la asistencia cuando quieras**
  "Revisa desde tu panel quiénes asistieron a cada clase y mantén tus registros organizados en un solo lugar."

- Imagen central — alt: "Celular escaneando el código QR de una clase"

Todos los textos describen funcionalidades que ya existen en el backend.

---

## 4. Commits por fase

Formato: tipo convencional + descripción en español, en imperativo.

| Fase | Commit |
|---|---|
| 0 | `docs(front): agregar bocetos de la nueva UI y plan de refactor` |
| 1 | `feat(front): definir tokens de color y variante oscura en Tailwind` |
| 1 | `feat(front): agregar hook useTema con persistencia y script anti-parpadeo` |
| 1 | `fix(front): conservar preferencias al cerrar sesión en lugar de limpiar todo el localStorage` |
| 2 | `feat(front): crear Header, BotonTema y MenuLateral compartidos` |
| 2 | `feat(front): crear PanelLayout para los paneles de docente y estudiante` |
| 3 | `feat(front): rediseñar hero de la homepage según boceto` |
| 3 | `feat(front): agregar sección "Con Presente" a la homepage` |
| 3 | `refactor(front): eliminar estilos de la landing anterior (App.css)` |
| 4 | `refactor(front): migrar PanelDocente a PanelLayout` |
| 4 | `feat(front): rediseñar tarjetas de clase con modal para ver QR` |
| 4 | `feat(front): rediseñar vistas de registro de asistencia y creación de clase` |
| 5 | `feat(front): rediseñar PanelEstudiante según boceto` |
| 6 | `style(front): aplicar nueva UI a Login, Registro y Asistencia` |
| 7 | `docs(front): actualizar README con la nueva estructura y el tema` |

Si la decisión del §5.1 incluye backend, se añaden commits `feat(back): ...` en una fase propia antes de la Fase 5.

---

## 5. Decisiones pendientes y riesgos

### Decisiones que necesitan confirmación
1. **Panel estudiante sin backend**: "Asistencia clases" y "Notas" no tienen endpoints ni modelo.
   Opciones: (a) incluir una fase de backend (`GET` historial del estudiante; modelo + endpoints de notas),
   (b) construir solo la UI con estado vacío "Próximamente". Además, falta definir qué es una *nota*
   (¿para el docente?, ¿por clase?, ¿privada?).
2. **Secciones del panel**: el boceto muestra las secciones apiladas y separadas por líneas punteadas.
   Recomendación: mantener la navegación por vistas actual (`activeView`) — cada botón de la sidebar
   muestra su sección — porque conserva la lógica existente y escala con muchas clases.
   Alternativa: una sola página con las secciones apiladas y la sidebar como anclas.
3. **Cerrar sesión**: no aparece en los bocetos. Propuesta: botón al final de la sidebar.
4. **Destino del botón "Iniciar"**: propuesta `/login`.

### Riesgos
- `localStorage.clear()` borraría el tema (se corrige en Fase 1).
- Tailwind 4 requiere la variante `dark` definida en CSS; `tailwind.config.js` no se usa.
- Eliminar `App.css` descarta el trabajo de los tres commits recientes de la landing (reemplazado por el boceto).
- Las pruebas manuales de paneles requieren el backend corriendo localmente.
- Fuera de alcance (deuda conocida, no se toca aquí): autenticación real en endpoints, protección de rutas por rol, `alert()` → toasts.
