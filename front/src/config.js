// Configuración centralizada para URLs de la API
// Lee de variable de entorno VITE_API_BASE_URL
// En local: http://localhost:8000
// En producción (Render): https://tu-app.render.com

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default API_BASE_URL
