-- Script para obtener un Space ID válido que realmente existe en la base de datos
-- Ejecuta este SQL en el SQL Editor de Supabase

-- 1. Ver todos los espacios disponibles
SELECT 
    id,
    code,
    name,
    type,
    status,
    "isActive"
FROM "Space" 
WHERE "isActive" = true
ORDER BY code;

-- 2. Obtener el primer Space ID válido
SELECT id as valid_space_id
FROM "Space" 
WHERE "isActive" = true 
LIMIT 1;

-- 3. Verificar que el Space ID existe
SELECT 
    'Space ID encontrado:' as mensaje,
    id,
    code,
    name
FROM "Space" 
WHERE id = (SELECT id FROM "Space" WHERE "isActive" = true LIMIT 1);