// Configuración centralizada para URLs de la API
// Se inyecta dinámicamente desde index.html basándose en el hostname

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000'

export default API_BASE_URL
