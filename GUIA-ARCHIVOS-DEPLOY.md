# 📁 GUÍA DE ARCHIVOS PARA DEPLOY

## 🎯 **RESUMEN RÁPIDO:**

- **NETLIFY**: Sube la carpeta `build` (frontend compilado)
- **VERCEL**: Sube la carpeta `backend` (código fuente del backend)

---

## 🟢 **NETLIFY (FRONTEND) - QUÉ SUBIR:**

### **OPCIÓN 1: DRAG & DROP (MÁS FÁCIL)**
```
📁 resto-sql/frontend/build/
├── 📄 index.html
├── 📁 static/
│   ├── 📁 css/
│   │   └── 📄 main.dfcb5ffb.css
│   └── 📁 js/
│       └── 📄 main.ea33284f.js
└── 📄 manifest.json
```

**PASOS:**
1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `build` completa
3. ¡Listo! Tu sitio estará disponible

### **OPCIÓN 2: GITHUB (RECOMENDADO)**
```
📁 resto-sql/frontend/
├── 📁 src/
├── 📁 public/
├── 📄 package.json
├── 📄 netlify.toml
├── 📄 _redirects
├── 📄 build.sh
└── 📄 deploy-netlify.sh
```

**PASOS:**
1. Sube todo el proyecto a GitHub
2. Conecta Netlify con GitHub
3. Configura el deploy automático

---

## 🔵 **VERCEL (BACKEND) - QUÉ SUBIR:**

### **OPCIÓN 1: CLI (MÁS FÁCIL)**
```
📁 resto-sql/backend/
├── 📁 src/
├── 📁 dist/
├── 📄 package.json
├── 📄 vercel.json
├── 📄 .env
└── 📄 tsconfig.json
```

**PASOS:**
1. Instala Vercel CLI: `npm install -g vercel`
2. Ve a la carpeta backend: `cd resto-sql/backend`
3. Ejecuta: `vercel`
4. Sigue las instrucciones

### **OPCIÓN 2: GITHUB (RECOMENDADO)**
```
📁 resto-sql/backend/
├── 📁 src/
├── 📁 dist/
├── 📄 package.json
├── 📄 vercel.json
├── 📄 .env
└── 📄 tsconfig.json
```

**PASOS:**
1. Sube todo el proyecto a GitHub
2. Conecta Vercel con GitHub
3. Configura el deploy automático

---

## 📋 **ARCHIVOS DE CONFIGURACIÓN:**

### **Para Netlify (Frontend):**
- ✅ `netlify.toml` - Configuración principal
- ✅ `_redirects` - Redirecciones para SPA
- ✅ `build.sh` - Script de build
- ✅ `deploy-netlify.sh` - Script de deploy

### **Para Vercel (Backend):**
- ✅ `vercel.json` - Configuración principal
- ✅ `.env` - Variables de entorno
- ✅ `package.json` - Dependencias y scripts

---

## 🚀 **PASOS DETALLADOS:**

### **PASO 1: PREPARAR EL FRONTEND**
```bash
cd resto-sql/frontend
npm run build
```
**Resultado**: Se crea la carpeta `build/` con archivos compilados

### **PASO 2: SUBIR A NETLIFY**
**Opción A - Drag & Drop:**
1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `build/`
3. ¡Listo!

**Opción B - GitHub:**
1. Sube `resto-sql/frontend/` a GitHub
2. Conecta Netlify con GitHub
3. Configura deploy automático

### **PASO 3: PREPARAR EL BACKEND**
```bash
cd resto-sql/backend
npm run build
```
**Resultado**: Se crea la carpeta `dist/` con archivos compilados

### **PASO 4: SUBIR A VERCEL**
**Opción A - CLI:**
```bash
cd resto-sql/backend
npm install -g vercel
vercel
```

**Opción B - GitHub:**
1. Sube `resto-sql/backend/` a GitHub
2. Conecta Vercel con GitHub
3. Configura deploy automático

---

## 🔧 **CONFIGURACIÓN DE VARIABLES:**

### **En Netlify (Frontend):**
```
REACT_APP_API_URL=https://tu-backend-url.vercel.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

### **En Vercel (Backend):**
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://tu-frontend-url.netlify.app
FRONTEND_URL=https://tu-frontend-url.netlify.app
```

---

## 📱 **RESULTADO FINAL:**

### **URLs de Acceso:**
- **Frontend**: `https://tu-sitio.netlify.app`
- **Backend**: `https://tu-backend-url.vercel.app`

### **Credenciales:**
- **Admin**: `admin` / `admin123`
- **Mozo**: `mozo1` / `mozo123`
- **Cocinero**: `cocinero1` / `cocinero123`

---

## 🆘 **SOLUCIÓN DE PROBLEMAS:**

### **Error en Netlify:**
- Verifica que la carpeta `build/` exista
- Revisa que `npm run build` funcione localmente
- Verifica las variables de entorno

### **Error en Vercel:**
- Verifica que la carpeta `dist/` exista
- Revisa que `npm run build` funcione localmente
- Verifica las variables de entorno

---

## 🎯 **RECOMENDACIÓN:**

**Para principiantes:**
1. **Netlify**: Usa drag & drop con la carpeta `build/`
2. **Vercel**: Usa CLI con `vercel`

**Para proyectos profesionales:**
1. **Netlify**: Conecta con GitHub
2. **Vercel**: Conecta con GitHub

---

## 🎉 **¡LISTO!**

**Archivos a subir:**
- **NETLIFY**: `resto-sql/frontend/build/` (carpeta completa)
- **VERCEL**: `resto-sql/backend/` (carpeta completa)

**¡Tu sistema estará disponible en la web! 🚀**




