-- Script para verificar el usuario admin
-- =====================================================

-- 1. Verificar si existe el usuario admin
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    is_active,
    "createdAt",
    "updatedAt"
FROM "User" 
WHERE username = 'admin';

-- 2. Verificar la función auth_login
SELECT auth_login('admin', 'admin123');

-- 3. Verificar si la extensión pgcrypto está habilitada
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- 4. Probar el hash de la contraseña
SELECT 
    'admin123' as password_input,
    crypt('admin123', gen_salt('bf')) as new_hash,
    (SELECT password_hash FROM "User" WHERE username = 'admin') as stored_hash,
    crypt('admin123', (SELECT password_hash FROM "User" WHERE username = 'admin')) = (SELECT password_hash FROM "User" WHERE username = 'admin') as password_match;

-- 5. Verificar todos los usuarios
SELECT 
    username,
    email,
    role,
    is_active,
    "createdAt"
FROM "User" 
ORDER BY "createdAt";
