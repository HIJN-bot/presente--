#!/bin/sh
set -e

# BACKEND_URL define a que backend apunta el frontend en runtime.
# Es obligatoria: si no esta definida preferimos abortar el arranque antes que
# servir un frontend que apunta silenciosamente al backend equivocado.
if [ -z "$BACKEND_URL" ]; then
  echo "ERROR: la variable de entorno BACKEND_URL no esta definida." >&2
  echo "Definela en el servicio (Render) o en docker-compose.yml antes de arrancar." >&2
  echo "Ejemplo: BACKEND_URL=https://presente-backend-<sufijo>.onrender.com" >&2
  exit 1
fi

# Crear archivo de configuración que el frontend puede cargar
cat > /usr/share/nginx/html/config.json <<EOF
{
  "API_BASE_URL": "${BACKEND_URL}"
}
EOF

# Iniciar nginx
exec nginx -g "daemon off;"
