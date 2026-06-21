#!/bin/sh
set -e

# Usar la variable VITE_BACKEND_URL si está definida, sino usar la por defecto
if [ -z "$VITE_BACKEND_URL" ]; then
  export VITE_BACKEND_URL="https://presente-backend.onrender.com"
fi

# Inyectar la URL en index.html
sed -i "s|https://presente-backend.onrender.com|${VITE_BACKEND_URL}|g" /usr/share/nginx/html/index.html

# Iniciar nginx
exec nginx -g "daemon off;"
