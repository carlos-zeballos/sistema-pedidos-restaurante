# 🚀 GUÍA DE DEPLOY - SISTEMA DE PEDIDOS

## 📋 PREPARACIÓN PARA PRODUCCIÓN

### 1. CONFIGURAR VARIABLES DE ENTORNO

Crea un archivo `.env` en el backend con estas variables:

```env
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
```

### 2. OPCIONES DE HOSTING

#### 🟢 OPCIÓN 1: VERCEL (Recomendado para principiantes)
- **Backend**: Vercel Functions
- **Frontend**: Vercel Static
- **Base de datos**: Supabase (ya configurada)
- **Costo**: Gratis para proyectos pequeños

#### 🟡 OPCIÓN 2: RAILWAY
- **Backend**: Railway App
- **Frontend**: Vercel o Netlify
- **Base de datos**: Supabase
- **Costo**: $5/mes

#### 🔵 OPCIÓN 3: HEROKU
- **Backend**: Heroku App
- **Frontend**: Netlify
- **Base de datos**: Supabase
- **Costo**: $7/mes

### 3. CONFIGURAR SUPABASE EN PRODUCCIÓN

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia las credenciales:
   - Project URL
   - Anon Key
   - Service Role Key
4. Ejecuta el SQL de la base de datos en el nuevo proyecto

### 4. PASOS DE DEPLOY

#### Backend (Vercel):
1. Instala Vercel CLI: `npm i -g vercel`
2. En la carpeta `backend`: `vercel`
3. Configura las variables de entorno en Vercel
4. Deploy: `vercel --prod`

#### Frontend (Vercel):
1. En la carpeta `frontend`: `vercel`
2. Configura las variables de entorno
3. Deploy: `vercel --prod`

### 5. CONFIGURAR DOMINIO

1. Compra un dominio (GoDaddy, Namecheap, etc.)
2. Configura DNS en Vercel
3. Actualiza CORS_ORIGIN en el backend

## 🔧 COMANDOS ÚTILES

```bash
# Build del backend
cd backend
npm run build

# Build del frontend
cd frontend
npm run build

# Test local de producción
cd backend
npm run start:prod
```

## 📱 CONFIGURACIÓN MÓVIL

Para usar en tablets/móviles en tu empresa:
1. Configura PWA (Progressive Web App)
2. Agrega manifest.json
3. Configura service worker
4. Instala como app nativa

## 🔒 SEGURIDAD EN PRODUCCIÓN

1. Usa HTTPS siempre
2. Configura JWT_SECRET seguro
3. Limita CORS a tu dominio
4. Configura rate limiting
5. Monitorea logs

## 📊 MONITOREO

1. Configura logs en Vercel
2. Monitorea errores
3. Configura alertas
4. Revisa métricas de uso











