-- =========================================================
-- OBTENER UN USUARIO VÁLIDO PARA PRUEBAS
-- =========================================================
-- Este script obtiene un usuario válido para usar en las pruebas
-- =========================================================

SELECT 
    id,
    username,
    email,
    "createdAt"
FROM "User" 
ORDER BY "createdAt" DESC
LIMIT 5;





