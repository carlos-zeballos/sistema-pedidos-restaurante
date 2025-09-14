
#!/bin/bash

# 🚀 SCRIPT DE DEPLOY AUTOMATIZADO
# Sistema de Reportes - Deploy Completo

echo "🚀 INICIANDO DEPLOY DEL SISTEMA DE REPORTES"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
show_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

show_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

show_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -d "resto-sql" ]; then
    show_error "Directorio 'resto-sql' no encontrado. Ejecutar desde la raíz del proyecto."
    exit 1
fi

show_message "Verificando estructura del proyecto..."

# =====================================================
# 1. DEPLOY BACKEND
# =====================================================

echo ""
echo "🔧 DEPLOY BACKEND (NestJS + Supabase)"
echo "======================================"

cd resto-sql/backend

show_message "Instalando dependencias del backend..."
if npm install; then
    show_success "Dependencias del backend instaladas correctamente"
else
    show_error "Error instalando dependencias del backend"
    exit 1
fi

show_message "Compilando TypeScript..."
if npm run build; then
    show_success "Backend compilado correctamente"
else
    show_error "Error compilando el backend"
    exit 1
fi

# Verificar que se creó el directorio dist
if [ -d "dist" ]; then
    show_success "Directorio 'dist' creado correctamente"
    show_message "Archivos compilados:"
    ls -la dist/
else
    show_error "Directorio 'dist' no encontrado"
    exit 1
fi

# Volver al directorio raíz
cd ../..

# =====================================================
# 2. DEPLOY FRONTEND
# =====================================================

echo ""
echo "🎨 DEPLOY FRONTEND (React + Tailwind)"
echo "======================================"

cd resto-sql/frontend

show_message "Instalando dependencias del frontend..."
if npm install; then
    show_success "Dependencias del frontend instaladas correctamente"
else
    show_error "Error instalando dependencias del frontend"
    exit 1
fi

show_message "Compilando React para producción..."
if npm run build; then
    show_success "Frontend compilado correctamente"
else
    show_error "Error compilando el frontend"
    exit 1
fi

# Verificar que se creó el directorio build
if [ -d "build" ]; then
    show_success "Directorio 'build' creado correctamente"
    show_message "Archivos compilados:"
    ls -la build/
else
    show_error "Directorio 'build' no encontrado"
    exit 1
fi

# Volver al directorio raíz
cd ../..

# =====================================================
# 3. VERIFICACIONES FINALES
# =====================================================

echo ""
echo "✅ VERIFICACIONES FINALES"
echo "========================="

# Verificar archivos importantes
show_message "Verificando archivos de configuración..."

if [ -f "render.yaml" ]; then
    show_success "render.yaml encontrado"
else
    show_warning "render.yaml no encontrado"
fi

if [ -f "fix-reports-final.sql" ]; then
    show_success "fix-reports-final.sql encontrado"
else
    show_warning "fix-reports-final.sql no encontrado"
fi

if [ -f "SCRIPT-DEFINITIVO-SIMPLIFICAR-ESTADOS.sql" ]; then
    show_success "SCRIPT-DEFINITIVO-SIMPLIFICAR-ESTADOS.sql encontrado"
else
    show_warning "SCRIPT-DEFINITIVO-SIMPLIFICAR-ESTADOS.sql no encontrado"
fi

# =====================================================
# 4. INSTRUCCIONES DE DEPLOY
# =====================================================

echo ""
echo "🚀 INSTRUCCIONES PARA DEPLOY"
echo "============================="

echo ""
show_message "BACKEND (Render.com):"
echo "1. Conectar repositorio a Render"
echo "2. Usar configuración de render.yaml"
echo "3. Configurar variables de entorno:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - JWT_SECRET"
echo "   - CORS_ORIGIN (https://sistema-pedidos-kurp.netlify.app)"

echo ""
show_message "FRONTEND (Netlify):"
echo "1. Conectar repositorio a Netlify"
echo "2. Build command: npm run build"
echo "3. Publish directory: resto-sql/frontend/build"
echo "4. Configurar variables de entorno:"
echo "   - REACT_APP_API_URL (URL del backend)"

echo ""
show_message "BASE DE DATOS (Supabase):"
echo "1. Ejecutar fix-reports-final.sql en SQL Editor"
echo "2. Ejecutar SCRIPT-DEFINITIVO-SIMPLIFICAR-ESTADOS.sql"
echo "3. Verificar funciones RPC"

echo ""
show_success "🎉 PREPARACIÓN PARA DEPLOY COMPLETADA"
echo ""
show_message "Próximos pasos:"
echo "1. Hacer commit y push de los cambios"
echo "2. Configurar deploy en Render y Netlify"
echo "3. Ejecutar scripts SQL en Supabase"
echo "4. Probar sistema completo"

echo ""
show_message "Archivos listos para deploy:"
echo "✅ Backend compilado en resto-sql/backend/dist/"
echo "✅ Frontend compilado en resto-sql/frontend/build/"
echo "✅ Scripts SQL listos para ejecutar"
echo "✅ Configuración de deploy preparada"

echo ""
echo "🚀 ¡SISTEMA LISTO PARA DEPLOY! 🚀"
