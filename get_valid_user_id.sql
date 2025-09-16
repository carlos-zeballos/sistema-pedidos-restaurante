-- Script para obtener un User ID válido que realmente existe en la base de datos
-- Ejecuta este SQL en el SQL Editor de Supabase

-- 1. Ver todos los usuarios disponibles
SELECT 
    id,
    username,
    firstname,
    lastname,
    email,
    role,
    isactive
FROM "User" 
WHERE isactive = true
ORDER BY username;

-- 2. Obtener el primer User ID válido
SELECT id as valid_user_id
FROM "User" 
WHERE isactive = true 
LIMIT 1;

-- 3. Verificar que el User ID existe
SELECT 
    'User ID encontrado:' as mensaje,
    id,
    username,
    firstname,
    lastname,
    role
FROM "User" 
WHERE id = (SELECT id FROM "User" WHERE isactive = true LIMIT 1);






