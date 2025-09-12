# 🚀 DEPLOY A NETLIFY - SISTEMA DE PEDIDOS

## ✅ **PASO 1: PREPARAR EL PROYECTO**

### 1.1 Verificar que el build funciona
```bash
cd resto-sql/frontend
npm run build
```

### 1.2 Archivos de configuración creados:
- ✅ `netlify.toml` - Configuración principal de Netlify
- ✅ `_redirects` - Redirecciones para SPA
- ✅ `build.sh` - Script de build personalizado

---

## ✅ **PASO 2: CREAR CUENTA EN NETLIFY**

### 2.1 Registrarse en Netlify
1. Ve a [netlify.com](https://netlify.com)
2. Haz clic en "Sign up"
3. Conecta con GitHub (recomendado) o crea cuenta con email
4. Verifica tu email si es necesario

### 2.2 Conectar con GitHub (Recomendado)
1. Haz clic en "New site from Git"
2. Selecciona "GitHub"
3. Autoriza Netlify a acceder a tus repositorios
4. Busca tu repositorio del sistema de pedidos

---

## ✅ **PASO 3: CONFIGURAR EL DEPLOY**

### 3.1 Configuración del Build
- **Base directory**: `resto-sql/frontend`
- **Build command**: `npm run build`
- **Publish directory**: `resto-sql/frontend/build`

### 3.2 Variables de Entorno
Ve a "Site settings" > "Environment variables" y agrega:

```
REACT_APP_API_URL=https://tu-backend-url.vercel.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

### 3.3 Configuración Avanzada
- **Node version**: `18`
- **NPM version**: `latest`

---

## ✅ **PASO 4: DEPLOY MANUAL (ALTERNATIVA)**

### 4.1 Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### 4.2 Login en Netlify
```bash
netlify login
```

### 4.3 Deploy desde carpeta build
```bash
cd resto-sql/frontend
npm run build
netlify deploy --prod --dir=build
```

### 4.4 Deploy con drag & drop
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta `build` a la zona de deploy
3. ¡Listo! Tu sitio estará disponible

---

## ✅ **PASO 5: CONFIGURAR DOMINIO PERSONALIZADO**

### 5.1 Dominio personalizado
1. Ve a "Site settings" > "Domain management"
2. Haz clic en "Add custom domain"
3. Ingresa tu dominio (ej: `turestaurante.com`)
4. Configura los registros DNS:
   - **A Record**: `@` → `75.2.60.5`
   - **CNAME**: `www` → `tu-sitio.netlify.app`

### 5.2 SSL automático
- Netlify proporciona SSL automático
- Tu sitio será accesible via HTTPS

---

## ✅ **PASO 6: CONFIGURAR BACKEND**

### 6.1 Opciones para el backend:

#### Opción A: Vercel (Recomendado)
```bash
cd resto-sql/backend
npm install -g vercel
vercel
```

#### Opción B: Railway
1. Ve a [railway.app](https://railway.app)
2. Conecta con GitHub
3. Selecciona tu repositorio
4. Configura las variables de entorno

#### Opción C: Heroku
1. Ve a [heroku.com](https://heroku.com)
2. Crea una nueva app
3. Conecta con GitHub
4. Configura las variables de entorno

---

## ✅ **PASO 7: CONFIGURAR SUPABASE**

### 7.1 Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ejecuta el SQL de la base de datos
4. Crea los usuarios

### 7.2 Obtener credenciales
1. Ve a "Settings" > "API"
2. Copia:
   - Project URL
   - Anon Key
   - Service Role Key

---

## ✅ **PASO 8: PROBAR EL SISTEMA**

### 8.1 URLs de acceso
- **Frontend**: `https://tu-sitio.netlify.app`
- **Backend**: `https://tu-backend-url.vercel.app`

### 8.2 Credenciales de prueba
- **Admin**: `admin` / `admin123`
- **Mozo**: `mozo1` / `mozo123`
- **Cocinero**: `cocinero1` / `cocinero123`

---

## 🔧 **COMANDOS ÚTILES**

```bash
# Ver logs del sitio
netlify logs

# Ver estado del sitio
netlify status

# Redesplegar
netlify deploy --prod

# Ver sitios
netlify sites:list
```

---

## 📱 **CONFIGURACIÓN PARA USO EN EMPRESA**

### Para Tablets/Móviles:
1. Accede desde el navegador
2. Agrega a pantalla de inicio
3. Configura como PWA

### Para Múltiples Dispositivos:
1. Configura WiFi de la empresa
2. Accede desde cualquier dispositivo
3. Usa diferentes roles según el personal

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### Error de Build:
- Verifica que todas las dependencias estén instaladas
- Revisa los logs de build en Netlify
- Asegúrate de que el comando `npm run build` funcione localmente

### Error 404 en rutas:
- Verifica que el archivo `_redirects` esté en la carpeta build
- Asegúrate de que las redirecciones estén configuradas

### Error de CORS:
- Verifica que REACT_APP_API_URL apunte al backend correcto
- Revisa la configuración de CORS en el backend

---

## 🎉 **VENTAJAS DE NETLIFY**

- ✅ **Gratis** para proyectos pequeños
- ✅ **SSL automático**
- ✅ **CDN global** (sitio rápido en todo el mundo)
- ✅ **Deploy automático** desde GitHub
- ✅ **Formularios** (si necesitas contactos)
- ✅ **Funciones serverless** (si necesitas lógica del servidor)
- ✅ **Branch previews** (ver cambios antes de publicar)

---

## 📞 **SOPORTE**

Si tienes problemas:
1. Revisa los logs en Netlify
2. Verifica las variables de entorno
3. Prueba el build localmente
4. Contacta al desarrollador

---

## 🎯 **PRÓXIMOS PASOS**

1. **Crea cuenta en Netlify**
2. **Conecta tu repositorio**
3. **Configura las variables de entorno**
4. **Haz el deploy**
5. **Configura tu dominio personalizado**
6. **¡Prueba tu sistema en producción!**

---

## 🚀 **¡FELICITACIONES!**

Tu sistema de pedidos estará disponible en:
- **URL de Netlify**: `https://tu-sitio.netlify.app`
- **Dominio personalizado**: `https://turestaurante.com` (opcional)

**¡Listo para usar en tu empresa! 🎉**









