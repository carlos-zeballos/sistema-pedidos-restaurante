-- =====================================================
-- OBTENER IDs PARA PRUEBA DE PEDIDO
-- =====================================================

-- 1. Verificar si hay espacios activos
SELECT 'Espacios disponibles:' as info;
SELECT id, code, name, type FROM "Space" WHERE "isActive" = true;

-- 2. Verificar si hay usuarios activos
SELECT 'Usuarios disponibles:' as info;
SELECT id, username, role FROM "User" WHERE isactive = true;

-- 3. Si no hay usuarios activos, ver todos los usuarios
SELECT 'Todos los usuarios (si no hay activos):' as info;
SELECT id, username, role, isactive FROM "User" LIMIT 5;

-- 4. Verificar estructura de tabla User
SELECT 'Columnas de tabla User:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'User' AND column_name LIKE '%active%';






