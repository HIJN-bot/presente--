#!/bin/sh
set -e

# Usar la variable BACKEND_URL si está definida, sino usar la por defecto para Render
if [ -z "$BACKEND_URL" ]; then
  export BACKEND_URL="https://presente-backend-jvq5.onrender.com"
fi

# Inyectar la URL del backend en index.html
sed -i "s|__BACKEND_URL__|${BACKEND_URL}|g" /usr/share/nginx/html/index.html

# Iniciar nginx
exec nginx -g "daemon off;"
