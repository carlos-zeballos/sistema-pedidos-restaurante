-- Script para corregir el usuario admin
-- =====================================================

-- 1. Habilitar extensión pgcrypto si no está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Eliminar usuario admin existente si existe
DELETE FROM "User" WHERE username = 'admin';

-- 3. Insertar usuario admin con contraseña correcta
INSERT INTO "User" (
    username, 
    email, 
    password_hash, 
    full_name, 
    role, 
    is_active,
    "createdAt",
    "updatedAt"
) 
VALUES (
    'admin', 
    'admin@resto.com', 
    crypt('admin123', gen_salt('bf')), 
    'Administrador', 
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- 4. Verificar que el usuario se creó correctamente
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    is_active,
    "createdAt"
FROM "User" 
WHERE username = 'admin';

-- 5. Probar la función auth_login
SELECT auth_login('admin', 'admin123');

-- 6. Verificar el hash de la contraseña
SELECT 
    'admin123' as password_input,
    crypt('admin123', (SELECT password_hash FROM "User" WHERE username = 'admin')) = (SELECT password_hash FROM "User" WHERE username = 'admin') as password_match;
