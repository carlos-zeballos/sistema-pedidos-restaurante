# 🚀 INSTRUCCIONES DE DEPLOY - SISTEMA DE PEDIDOS

## ✅ **PASO 1: CONFIGURAR SUPABASE (BASE DE DATOS)**

### 1.1 Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "New Project"
3. Elige tu organización
4. Nombre del proyecto: `sistema-pedidos-restaurante`
5. Contraseña de la base de datos: `tu_contraseña_segura`
6. Región: `South America (São Paulo)` (más cerca de Perú)
7. Haz clic en "Create new project"

### 1.2 Configurar Base de Datos
1. Ve a la pestaña "SQL Editor"
2. Copia y pega el contenido del archivo `database-schema.sql`
3. Ejecuta el SQL para crear todas las tablas
4. Ve a la pestaña "Authentication" > "Users"
5. Crea los usuarios:
   - **Admin**: username: `admin`, password: `admin123`, role: `ADMIN`
   - **Mozo 1**: username: `mozo1`, password: `mozo123`, role: `MOZO`
   - **Mozo 2**: username: `mozo2`, password: `mozo123`, role: `MOZO`
   - **Cocinero**: username: `cocinero1`, password: `cocinero123`, role: `COCINERO`

### 1.3 Obtener Credenciales
1. Ve a "Settings" > "API"
2. Copia:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ✅ **PASO 2: INSTALAR VERCEL CLI**

```bash
npm install -g vercel
```

---

## ✅ **PASO 3: DEPLOY DEL BACKEND**

### 3.1 Configurar Variables de Entorno
1. Ve a la carpeta `backend`
2. Crea un archivo `.env` con:

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://tu-frontend-url.vercel.app
FRONTEND_URL=https://tu-frontend-url.vercel.app
LOG_LEVEL=info
```

### 3.2 Deploy a Vercel
```bash
cd backend
vercel
```

**Configuración en Vercel:**
- Project Name: `sistema-pedidos-backend`
- Framework: `Other`
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 3.3 Configurar Variables en Vercel
1. Ve a tu proyecto en Vercel
2. Ve a "Settings" > "Environment Variables"
3. Agrega todas las variables del archivo `.env`

---

## ✅ **PASO 4: DEPLOY DEL FRONTEND**

### 4.1 Configurar Variables de Entorno
1. Ve a la carpeta `frontend`
2. Crea un archivo `.env` con:

```env
REACT_APP_API_URL=https://tu-backend-url.vercel.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

### 4.2 Deploy a Vercel
```bash
cd frontend
vercel
```

**Configuración en Vercel:**
- Project Name: `sistema-pedidos-frontend`
- Framework: `Create React App`
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

### 4.3 Configurar Variables en Vercel
1. Ve a tu proyecto en Vercel
2. Ve a "Settings" > "Environment Variables"
3. Agrega todas las variables del archivo `.env`

---

## ✅ **PASO 5: CONFIGURAR DOMINIO PERSONALIZADO (OPCIONAL)**

### 5.1 Comprar Dominio
- Recomendado: [Namecheap](https://namecheap.com) o [GoDaddy](https://godaddy.com)
- Ejemplo: `turestaurante.com`

### 5.2 Configurar DNS
1. En Vercel, ve a "Settings" > "Domains"
2. Agrega tu dominio
3. Configura los registros DNS:
   - **A Record**: `@` → `76.76.19.61`
   - **CNAME**: `www` → `cname.vercel-dns.com`

---

## ✅ **PASO 6: PROBAR EL SISTEMA**

### 6.1 URLs de Acceso
- **Frontend**: `https://tu-frontend-url.vercel.app`
- **Backend**: `https://tu-backend-url.vercel.app`

### 6.2 Credenciales de Prueba
- **Admin**: `admin` / `admin123`
- **Mozo**: `mozo1` / `mozo123`
- **Cocinero**: `cocinero1` / `cocinero123`

---

## 🔧 **COMANDOS ÚTILES**

```bash
# Ver logs del backend
vercel logs tu-backend-url.vercel.app

# Ver logs del frontend
vercel logs tu-frontend-url.vercel.app

# Redesplegar
vercel --prod

# Ver estado de los proyectos
vercel ls
```

---

## 📱 **CONFIGURACIÓN PARA USO EN EMPRESA**

### Para Tablets/Móviles:
1. Accede desde el navegador
2. Agrega a pantalla de inicio
3. Configura como PWA (Progressive Web App)

### Para Múltiples Dispositivos:
1. Configura WiFi de la empresa
2. Accede desde cualquier dispositivo
3. Usa diferentes roles según el personal

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### Error 401 (Unauthorized):
- Verifica que las credenciales de Supabase sean correctas
- Revisa que el JWT_SECRET esté configurado

### Error CORS:
- Verifica que CORS_ORIGIN apunte a tu frontend
- Revisa que FRONTEND_URL esté configurado

### Error de Base de Datos:
- Verifica que el SQL se ejecutó correctamente
- Revisa que los usuarios estén creados

---

## 📞 **SOPORTE**

Si tienes problemas:
1. Revisa los logs en Vercel
2. Verifica las variables de entorno
3. Prueba los endpoints con Postman
4. Contacta al desarrollador

---

## 🎉 **¡FELICITACIONES!**

Tu sistema de pedidos está listo para usar en tu empresa. 

**Características principales:**
- ✅ Gestión de órdenes en tiempo real
- ✅ Vista de cocina con cronómetros
- ✅ Vista de mozos para gestión
- ✅ Reportes y estadísticas
- ✅ Gestión de espacios/mesas
- ✅ Catálogo de productos y combos
- ✅ Sistema de autenticación por roles
- ✅ Responsive para tablets y móviles











