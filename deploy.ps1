# Deploy script for Proyecto Presente
# Uso: .\deploy.ps1

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host "$Message" -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host ""
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ Error: $Message" -ForegroundColor Red
    exit 1
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Main
Write-Header "🚀 Proyecto Presente - Sistema de Deployment"

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Success "Docker encontrado: $dockerVersion"
}
catch {
    Write-Error-Custom "Docker no está instalado. Descárgalo desde https://www.docker.com"
}

# Check if Docker Compose is installed
try {
    $composeVersion = docker-compose --version
    Write-Success "Docker Compose encontrado: $composeVersion"
}
catch {
    Write-Error-Custom "Docker Compose no está instalado"
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Warning-Custom ".env no encontrado, creando desde .env.example"
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Success ".env creado. Por favor edita los valores si es necesario."
    }
    else {
        Write-Error-Custom ".env.example no encontrado"
    }
}

# Menu
Write-Host "¿Qué deseas hacer?" -ForegroundColor Cyan
Write-Host "1) Compilar imágenes (build)"
Write-Host "2) Iniciar servicios"
Write-Host "3) Compilar e iniciar (primera vez)"
Write-Host "4) Ver logs"
Write-Host "5) Detener servicios"
Write-Host "6) Reiniciar servicios"
Write-Host "7) Ver estado de contenedores"
Write-Host "8) Limpiar todo (eliminar volúmenes)"
Write-Host "9) Salir"

$option = Read-Host "Selecciona una opción (1-9)"

switch ($option) {
    "1" {
        Write-Header "Compilando imágenes..."
        docker-compose build
        Write-Success "Imágenes compiladas"
    }
    "2" {
        Write-Header "Iniciando servicios..."
        docker-compose up -d
        Start-Sleep -Seconds 3
        docker-compose ps
        Write-Success "Servicios iniciados"
        Write-Host ""
        Write-Host "📱 Acceso:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost"
        Write-Host "   Backend API: http://localhost:8000"
        Write-Host "   API Docs: http://localhost:8000/docs"
    }
    "3" {
        Write-Header "Compilando e iniciando servicios..."
        docker-compose build
        docker-compose up -d
        Start-Sleep -Seconds 3
        docker-compose ps
        Write-Success "Servicios iniciados"
        Write-Host ""
        Write-Host "📱 Acceso:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost"
        Write-Host "   Backend API: http://localhost:8000"
        Write-Host "   API Docs: http://localhost:8000/docs"
    }
    "4" {
        Write-Header "Mostrando logs (Ctrl+C para salir)..."
        docker-compose logs -f
    }
    "5" {
        Write-Header "Deteniendo servicios..."
        docker-compose down
        Write-Success "Servicios detenidos"
    }
    "6" {
        Write-Header "Reiniciando servicios..."
        docker-compose restart
        Start-Sleep -Seconds 2
        docker-compose ps
        Write-Success "Servicios reiniciados"
    }
    "7" {
        Write-Header "Estado de contenedores"
        docker-compose ps
    }
    "8" {
        Write-Warning-Custom "Esto eliminará todos los volúmenes de datos (BD, etc)"
        $confirm = Read-Host "¿Estás seguro? (s/n)"
        if ($confirm -eq "s") {
            Write-Header "Eliminando servicios y volúmenes..."
            docker-compose down -v
            Write-Success "Todo eliminado"
        }
        else {
            Write-Warning-Custom "Operación cancelada"
        }
    }
    "9" {
        Write-Success "Saliendo..."
        exit 0
    }
    default {
        Write-Error-Custom "Opción inválida"
    }
}
