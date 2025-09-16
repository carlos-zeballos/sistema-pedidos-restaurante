# 🚀 SCRIPT DE DEPLOY COMPLETO

## 📋 PASOS PARA DEPLOY

### ✅ 1. BACKEND (Render.com)

**Configuración actual en `render.yaml`:**
- ✅ Servicio: `sistema-pedidos-backend`
- ✅ Build Command: `npm install && npm run build`
- ✅ Start Command: `npm run start:prod`
- ✅ Puerto: `10000`
- ✅ Variables de entorno configuradas

**Comandos para deploy:**
```bash
# 1. Navegar al directorio del backend
cd resto-sql/backend

# 2. Instalar dependencias
npm install

# 3. Compilar TypeScript
npm run build

# 4. Verificar que la compilación fue exitosa
ls dist/

# 5. Probar localmente (opcional)
npm run start:prod
```

### ✅ 2. FRONTEND (Netlify)

**Configuración necesaria:**
- ✅ Build Command: `npm run build`
- ✅ Publish Directory: `build`
- ✅ Variables de entorno para API

**Comandos para deploy:**
```bash
# 1. Navegar al directorio del frontend
cd resto-sql/frontend

# 2. Instalar dependencias
npm install

# 3. Compilar para producción
npm run build

# 4. Verificar que la compilación fue exitosa
ls build/

# 5. Probar localmente (opcional)
npx serve -s build
```

### ✅ 3. BASE DE DATOS (Supabase)

**Scripts SQL a ejecutar:**
1. `fix-reports-final.sql` - Funciones RPC corregidas
2. `SCRIPT-DEFINITIVO-SIMPLIFICAR-ESTADOS.sql` - Estados simplificados

**Comandos:**
```sql
-- Ejecutar en Supabase SQL Editor
\i fix-reports-final.sql
\i SCRIPT-DEFINITIVO-SIMPLIFICAR-ESTADOS.sql
```

## 🔧 VERIFICACIONES PRE-DEPLOY

### ✅ Backend:
- [ ] Compilación sin errores
- [ ] Servicio de reportes funcional
- [ ] Integración con Supabase
- [ ] Variables de entorno configuradas

### ✅ Frontend:
- [ ] Compilación sin errores
- [ ] Nueva pestaña de reportes incluida
- [ ] Estilos CSS aplicados
- [ ] API endpoints configurados

### ✅ Base de Datos:
- [ ] Funciones RPC actualizadas
- [ ] Estados simplificados
- [ ] Datos consistentes

## 🚀 PROCESO DE DEPLOY

### 1. Deploy Backend (Render):
1. Conectar repositorio a Render
2. Configurar variables de entorno
3. Deploy automático

### 2. Deploy Frontend (Netlify):
1. Conectar repositorio a Netlify
2. Configurar build settings
3. Deploy automático

### 3. Actualizar Base de Datos:
1. Ejecutar scripts SQL en Supabase
2. Verificar funciones RPC
3. Probar reportes

## ✅ RESULTADO ESPERADO

- ✅ Backend funcionando en Render
- ✅ Frontend funcionando en Netlify
- ✅ Base de datos actualizada en Supabase
- ✅ Sistema de reportes completamente funcional
- ✅ Nueva pestaña de reportes operativa

## 🔗 URLs ESPERADAS

- **Backend:** `https://sistema-pedidos-backend.onrender.com`
- **Frontend:** `https://sistema-pedidos-kurp.netlify.app`
- **Base de Datos:** Supabase Dashboard

## 📞 SOPORTE

Si hay problemas durante el deploy:
1. Verificar logs en Render/Netlify
2. Revisar variables de entorno
3. Probar endpoints manualmente
4. Verificar conexión con Supabase
