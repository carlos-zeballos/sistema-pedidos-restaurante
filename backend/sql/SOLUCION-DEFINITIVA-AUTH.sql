-- SOLUCIÓN DEFINITIVA PARA AUTENTICACIÓN
-- =====================================================
-- Este script debe ejecutarse directamente en Supabase

-- 1. Habilitar extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Eliminar función auth_login existente
DROP FUNCTION IF EXISTS auth_login(TEXT, TEXT);

-- 3. Crear función auth_login completamente nueva y simple
CREATE OR REPLACE FUNCTION auth_login(
    p_username TEXT,
    p_password TEXT
)
RETURNS TABLE (
    id UUID,
    username VARCHAR(50),
    email VARCHAR(100),
    full_name VARCHAR(100),
    role VARCHAR(20),
    is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.email,
        u.full_name,
        u.role,
        u.is_active
    FROM "User" u
    WHERE u.username = p_username 
    AND u.password_hash = crypt(p_password, u.password_hash)
    AND u.is_active = true;
END;
$$;

-- 4. Eliminar usuario admin existente
DELETE FROM "User" WHERE username = 'admin';

-- 5. Crear usuario admin con contraseña correcta
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

-- 6. Otorgar permisos a la función
GRANT EXECUTE ON FUNCTION auth_login(TEXT, TEXT) TO PUBLIC;

-- 7. Verificar que todo funciona
SELECT 'Verificación final:' as test;
SELECT auth_login('admin', 'admin123');

-- 8. Verificar usuario admin
SELECT 
    'Usuario admin:' as status,
    username,
    email,
    role,
    is_active
FROM "User" 
WHERE username = 'admin';
