#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${GREEN}===================================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}===================================================${NC}\n"
}

print_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Main
print_header "🚀 Proyecto Presente - Sistema de Deployment"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Descárgalo desde https://www.docker.com"
fi

print_success "Docker encontrado: $(docker --version)"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
fi

print_success "Docker Compose encontrado: $(docker-compose --version)"

# Check if .env exists
if [ ! -f .env ]; then
    print_warning ".env no encontrado, creando desde .env.example"
    cp .env.example .env
    print_success ".env creado. Por favor edita los valores si es necesario."
fi

# Menu
echo "¿Qué deseas hacer?"
echo "1) Compilar imágenes (build)"
echo "2) Iniciar servicios"
echo "3) Compilar e iniciar (primera vez)"
echo "4) Ver logs"
echo "5) Detener servicios"
echo "6) Reiniciar servicios"
echo "7) Ver estado de contenedores"
echo "8) Limpiar todo (eliminar volúmenes)"
echo "9) Salir"

read -p "Selecciona una opción (1-9): " option

case $option in
    1)
        print_header "Compilando imágenes..."
        docker-compose build
        print_success "Imágenes compiladas"
        ;;
    2)
        print_header "Iniciando servicios..."
        docker-compose up -d
        sleep 3
        docker-compose ps
        print_success "Servicios iniciados"
        echo -e "\n📱 Acceso:"
        echo "   Frontend: http://localhost"
        echo "   Backend API: http://localhost:8000"
        echo "   API Docs: http://localhost:8000/docs"
        ;;
    3)
        print_header "Compilando e iniciando servicios..."
        docker-compose build
        docker-compose up -d
        sleep 3
        docker-compose ps
        print_success "Servicios iniciados"
        echo -e "\n📱 Acceso:"
        echo "   Frontend: http://localhost"
        echo "   Backend API: http://localhost:8000"
        echo "   API Docs: http://localhost:8000/docs"
        ;;
    4)
        print_header "Mostrando logs (Ctrl+C para salir)..."
        docker-compose logs -f
        ;;
    5)
        print_header "Deteniendo servicios..."
        docker-compose down
        print_success "Servicios detenidos"
        ;;
    6)
        print_header "Reiniciando servicios..."
        docker-compose restart
        sleep 2
        docker-compose ps
        print_success "Servicios reiniciados"
        ;;
    7)
        print_header "Estado de contenedores"
        docker-compose ps
        ;;
    8)
        print_warning "Esto eliminará todos los volúmenes de datos (BD, etc)"
        read -p "¿Estás seguro? (s/n): " confirm
        if [ "$confirm" = "s" ]; then
            print_header "Eliminando servicios y volúmenes..."
            docker-compose down -v
            print_success "Todo eliminado"
        else
            print_warning "Operación cancelada"
        fi
        ;;
    9)
        print_success "Saliendo..."
        exit 0
        ;;
    *)
        print_error "Opción inválida"
        ;;
esac
