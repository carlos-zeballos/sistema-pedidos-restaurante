# 🚀 INSTRUCCIONES PARA SUBIR A GITHUB

## ✅ **PASO 1: CREAR REPOSITORIO EN GITHUB**

### 1.1 Crear repositorio
1. Ve a [github.com](https://github.com)
2. Haz clic en "New repository" (botón verde)
3. **Nombre del repositorio**: `sistema-pedidos-restaurante`
4. **Descripción**: `Sistema de pedidos para restaurante con React, NestJS y Supabase`
5. **Visibilidad**: Público o Privado (tu elección)
6. **NO marques** "Add a README file"
7. **NO marques** "Add .gitignore"
8. **NO marques** "Choose a license"
9. Haz clic en "Create repository"

### 1.2 Copiar la URL del repositorio
Después de crear el repositorio, GitHub te mostrará una URL como:
```
https://github.com/tu-usuario/sistema-pedidos-restaurante.git
```

---

## ✅ **PASO 2: CONECTAR CON GITHUB**

### 2.1 Agregar el repositorio remoto
```bash
git remote add origin https://github.com/tu-usuario/sistema-pedidos-restaurante.git
```

### 2.2 Subir el código
```bash
git branch -M main
git push -u origin main
```

---

## ✅ **PASO 3: CONFIGURAR DEPLOY AUTOMÁTICO**

### 3.1 Netlify (Frontend)
1. Ve a [netlify.com](https://netlify.com)
2. Haz clic en "New site from Git"
3. Selecciona "GitHub"
4. Autoriza Netlify a acceder a tus repositorios
5. Selecciona `sistema-pedidos-restaurante`
6. **Configuración del build**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
7. Haz clic en "Deploy site"

### 3.2 Vercel (Backend)
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Selecciona "Import Git Repository"
4. Selecciona `sistema-pedidos-restaurante`
5. **Configuración del build**:
   - **Framework**: `Other`
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Haz clic en "Deploy"

---

## ✅ **PASO 4: CONFIGURAR VARIABLES DE ENTORNO**

### 4.1 En Netlify (Frontend)
Ve a "Site settings" > "Environment variables" y agrega:
```
REACT_APP_API_URL=https://tu-backend-url.vercel.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

### 4.2 En Vercel (Backend)
Ve a "Settings" > "Environment Variables" y agrega:
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

## ✅ **PASO 5: CONFIGURAR SUPABASE**

### 5.1 Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ejecuta el SQL de configuración
4. Crea los usuarios

### 5.2 Obtener credenciales
1. Ve a "Settings" > "API"
2. Copia las credenciales para las variables de entorno

---

## 🎯 **COMANDOS COMPLETOS:**

```bash
# 1. Crear repositorio en GitHub (hacerlo en el navegador)

# 2. Conectar con GitHub
git remote add origin https://github.com/tu-usuario/sistema-pedidos-restaurante.git

# 3. Subir código
git branch -M main
git push -u origin main

# 4. Configurar deploy automático en Netlify y Vercel
# (hacerlo en el navegador)
```

---

## 🎉 **RESULTADO FINAL:**

Después de completar todos los pasos tendrás:

- ✅ **Repositorio en GitHub**: `https://github.com/tu-usuario/sistema-pedidos-restaurante`
- ✅ **Frontend en Netlify**: `https://tu-sitio.netlify.app`
- ✅ **Backend en Vercel**: `https://tu-backend-url.vercel.app`
- ✅ **Base de datos en Supabase**: Configurada y funcionando
- ✅ **Deploy automático**: Cada push actualiza automáticamente

---

## 🔄 **FLUJO DE TRABAJO:**

1. **Hacer cambios** en tu código local
2. **Commit y push** a GitHub
3. **Deploy automático** en Netlify y Vercel
4. **Sistema actualizado** en producción

---

## 🆘 **SOLUCIÓN DE PROBLEMAS:**

### Error de autenticación:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

### Error de push:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error de deploy:
- Verifica las variables de entorno
- Revisa los logs de build
- Asegúrate de que las rutas estén correctas

---

## 🎯 **PRÓXIMOS PASOS:**

1. **Crear repositorio en GitHub**
2. **Ejecutar los comandos de conexión**
3. **Configurar deploy automático**
4. **Configurar variables de entorno**
5. **¡Probar tu sistema en producción!**

---

**¡Tu sistema estará disponible en la web! 🚀**




