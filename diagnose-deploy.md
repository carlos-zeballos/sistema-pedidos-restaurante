# 🔍 DIAGNÓSTICO DE AUTODEPLOY

## 📋 PASOS PARA VERIFICAR EL AUTODEPLOY

### ✅ 1. VERIFICAR REPOSITORIO GIT

```bash
# Verificar estado del repositorio
git status

# Verificar remotes configurados
git remote -v

# Verificar commits recientes
git log --oneline -5

# Verificar rama actual
git branch
```

### ✅ 2. VERIFICAR CONFIGURACIÓN DE RENDER

**Render.com - Backend:**
- ✅ Servicio conectado a GitHub
- ✅ Branch: `main` o `master`
- ✅ Build Command: `npm install && npm run build`
- ✅ Start Command: `npm run start:prod`
- ✅ Auto-deploy: Habilitado

**Verificar en Render Dashboard:**
1. Ir a [render.com/dashboard](https://render.com/dashboard)
2. Seleccionar servicio `sistema-pedidos-backend`
3. Verificar configuración de deploy
4. Revisar logs de deploy

### ✅ 3. VERIFICAR CONFIGURACIÓN DE NETLIFY

**Netlify - Frontend:**
- ✅ Site conectado a GitHub
- ✅ Branch: `main` o `master`
- ✅ Build Command: `npm run build`
- ✅ Publish Directory: `resto-sql/frontend/build`
- ✅ Auto-deploy: Habilitado

**Verificar en Netlify Dashboard:**
1. Ir a [netlify.com/app](https://netlify.com/app)
2. Seleccionar site `sistema-pedidos-kurp`
3. Verificar configuración de deploy
4. Revisar logs de deploy

### ✅ 4. POSIBLES PROBLEMAS

**Problema 1: Rama incorrecta**
- Render/Netlify configurados para `main` pero commits en `master`
- Solución: Cambiar rama o hacer push a la rama correcta

**Problema 2: Archivos no committeados**
- Cambios no están en el repositorio
- Solución: `git add . && git commit -m "mensaje" && git push`

**Problema 3: Webhook deshabilitado**
- GitHub webhooks no están funcionando
- Solución: Reconfigurar webhooks en Render/Netlify

**Problema 4: Errores de build**
- Build falla en Render/Netlify
- Solución: Revisar logs y corregir errores

### ✅ 5. SOLUCIONES RÁPIDAS

**Opción A: Deploy manual**
```bash
# Forzar deploy en Render
# Ir a Render Dashboard > Manual Deploy

# Forzar deploy en Netlify
# Ir a Netlify Dashboard > Trigger Deploy
```

**Opción B: Verificar y corregir**
```bash
# Verificar estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "fix: Corrección para autodeploy"

# Push
git push origin main
```

**Opción C: Reconfigurar servicios**
1. Desconectar repositorio en Render/Netlify
2. Reconectar con configuración correcta
3. Verificar webhooks

### ✅ 6. VERIFICACIÓN FINAL

**Backend (Render):**
- URL: `https://sistema-pedidos-backend.onrender.com`
- Estado: Deploy exitoso
- Logs: Sin errores

**Frontend (Netlify):**
- URL: `https://sistema-pedidos-kurp.netlify.app`
- Estado: Deploy exitoso
- Logs: Sin errores

## 🚨 ACCIONES INMEDIATAS

1. **Verificar estado del repositorio**
2. **Revisar logs en Render/Netlify**
3. **Verificar configuración de webhooks**
4. **Hacer deploy manual si es necesario**
5. **Ejecutar scripts SQL en Supabase**

## 📞 SOPORTE

Si el problema persiste:
1. Revisar logs detallados en Render/Netlify
2. Verificar configuración de GitHub webhooks
3. Contactar soporte de Render/Netlify
4. Considerar deploy manual como alternativa
