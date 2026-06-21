#!/bin/sh
set -e

# Usar la variable BACKEND_URL si está definida, sino usar la por defecto para Render
if [ -z "$BACKEND_URL" ]; then
  export BACKEND_URL="https://presente-backend-jvq5.onrender.com"
fi

# Crear archivo de configuración que el frontend puede cargar
cat > /usr/share/nginx/html/config.json <<EOF
{
  "API_BASE_URL": "${BACKEND_URL}"
}
EOF

# Iniciar nginx
exec nginx -g "daemon off;"
