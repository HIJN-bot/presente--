// Configuración centralizada para la URL de la API.
// Resolvemos en orden de prioridad:
//
//   1. window.API_BASE_URL -> configuración de RUNTIME. La inyecta index.html
//      leyendo el config.json que genera entrypoint.sh dentro del contenedor.
//      Va primero a propósito: es la única que conoce el entorno real donde se
//      está sirviendo la app, y debe poder corregir cualquier valor horneado
//      en el bundle durante el build.
//   2. import.meta.env.VITE_API_BASE_URL -> configuración de BUILD, para
//      desarrollo con Vite. Se define en front/.env.local (ignorado por git).
//      Aquí va la URL de un dev tunnel cuando pruebas desde el celular.
//   3. http://localhost:8000 -> último recurso para desarrollo sin configurar.
//
// En desarrollo no existe config.json, así que window.API_BASE_URL queda sin
// definir y manda VITE_API_BASE_URL. En producción manda config.json.
//
// Nunca escribas una URL directamente en este archivo: cámbiala en el .env.

const API_BASE_URL =
    window.API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8000'

export default API_BASE_URL
