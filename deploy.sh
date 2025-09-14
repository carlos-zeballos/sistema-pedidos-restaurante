#!/bin/bash

# 🚀 Script de Deploy Automatizado - Sistema de Pedidos
# Este script prepara y despliega el sistema completo

echo "🚀 INICIANDO DEPLOY DEL SISTEMA DE PEDIDOS"
echo "=========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "resto-sql/backend/package.json" ]; then
    print_error "No se encontró el proyecto. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

print_status "Verificando estructura del proyecto..."

# 1. PREPARAR BACKEND
print_status "Preparando backend para producción..."
cd resto-sql/backend

# Instalar dependencias
print_status "Instalando dependencias del backend..."
npm install

# Build del backend
print_status "Construyendo backend..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Backend construido exitosamente"
else
    print_error "Error al construir el backend"
    exit 1
fi

cd ../..

# 2. PREPARAR FRONTEND
print_status "Preparando frontend para producción..."
cd resto-sql/frontend

# Instalar dependencias
print_status "Instalando dependencias del frontend..."
npm install

# Build del frontend
print_status "Construyendo frontend..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend construido exitosamente"
else
    print_error "Error al construir el frontend"
    exit 1
fi

cd ../..

# 3. CREAR ARCHIVOS DE CONFIGURACIÓN
print_status "Creando archivos de configuración..."

# Crear .env para backend
cat > resto-sql/backend/.env << EOF
# Configuración de Producción
NODE_ENV=production
PORT=3001

# Base de datos Supabase (Producción)
SUPABASE_URL=tu_supabase_url_aqui
SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key_aqui

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://tu-dominio-frontend.com
FRONTEND_URL=https://tu-dominio-frontend.com

# Logging
LOG_LEVEL=info
EOF

# Crear .env para frontend
cat > resto-sql/frontend/.env << EOF
# Configuración del Frontend para Producción
REACT_APP_API_URL=https://tu-backend-url.vercel.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
EOF

print_success "Archivos de configuración creados"

# 4. CREAR ARCHIVOS DE DEPLOY
print_status "Creando archivos de deploy..."

# Vercel config para backend
cat > resto-sql/backend/vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "dist/src/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/src/main.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF

# Vercel config para frontend
cat > resto-sql/frontend/vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "build/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "build/$1"
    }
  ]
}
EOF

print_success "Archivos de deploy creados"

# 5. RESUMEN
echo ""
echo "🎉 DEPLOY PREPARADO EXITOSAMENTE"
echo "================================"
echo ""
print_success "Backend construido y listo para deploy"
print_success "Frontend construido y listo para deploy"
print_success "Archivos de configuración creados"
print_success "Archivos de deploy creados"
echo ""
print_warning "PRÓXIMOS PASOS:"
echo "1. Configura las variables de entorno en los archivos .env"
echo "2. Crea un proyecto en Supabase y actualiza las credenciales"
echo "3. Instala Vercel CLI: npm i -g vercel"
echo "4. Deploy backend: cd resto-sql/backend && vercel"
echo "5. Deploy frontend: cd resto-sql/frontend && vercel"
echo "6. Configura tu dominio personalizado"
echo ""
print_status "Para más detalles, revisa el archivo deploy-guide.md"











