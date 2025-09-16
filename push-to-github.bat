@echo off
echo 🚀 HACIENDO PUSH A GITHUB PARA AUTODEPLOY
echo ==========================================

echo.
echo Verificando estado del repositorio...
git status

echo.
echo Agregando todos los cambios...
git add .

echo.
echo Haciendo commit...
git commit -m "feat: Sistema de reportes completo - Autodeploy activado"

echo.
echo Haciendo push a GitHub...
git push origin main

echo.
echo ✅ PUSH COMPLETADO - AUTODEPLOY ACTIVADO
echo.
echo 🔄 Render.com detectará el push automáticamente
echo 🔄 Netlify detectará el push automáticamente
echo.
echo ⏱️ Tiempo estimado de deploy:
echo    Backend (Render): 3-5 minutos
echo    Frontend (Netlify): 2-3 minutos
echo.
echo 🎯 URLs esperadas:
echo    Backend: https://sistema-pedidos-backend.onrender.com
echo    Frontend: https://sistema-pedidos-kurp.netlify.app
echo.
pause
