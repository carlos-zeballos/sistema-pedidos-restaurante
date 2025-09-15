-- RECREAR USUARIO ADMIN COMPLETAMENTE
-- =====================================================

-- 1. Habilitar extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Eliminar TODOS los usuarios admin existentes
DELETE FROM "User" WHERE username = 'admin';
DELETE FROM "User" WHERE username = 'ADMIN';
DELETE FROM "User" WHERE username = 'Admin';

-- 3. Eliminar función auth_login existente
DROP FUNCTION IF EXISTS auth_login(TEXT, TEXT);

-- 4. Recrear función auth_login con logging
CREATE OR REPLACE FUNCTION auth_login(
    username_param TEXT,
    password_param TEXT
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
DECLARE
    user_record RECORD;
    password_match BOOLEAN;
BEGIN
    -- Buscar usuario
    SELECT * INTO user_record
    FROM "User" 
    WHERE username = username_param 
    AND is_active = true;
    
    -- Verificar si se encontró el usuario
    IF NOT FOUND THEN
        RAISE NOTICE 'Usuario no encontrado: %', username_param;
        RETURN;
    END IF;
    
    -- Verificar contraseña
    password_match := (user_record.password_hash = crypt(password_param, user_record.password_hash));
    
    IF password_match THEN
        RAISE NOTICE 'Login exitoso para usuario: %', username_param;
        RETURN QUERY
        SELECT 
            user_record.id,
            user_record.username,
            user_record.email,
            user_record.full_name,
            user_record.role,
            user_record.is_active;
    ELSE
        RAISE NOTICE 'Contraseña incorrecta para usuario: %', username_param;
        RETURN;
    END IF;
END;
$$;

-- 5. Crear usuario admin con hash manual
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

-- 6. Verificar usuario creado
SELECT 
    'Usuario admin creado:' as status,
    id,
    username,
    email,
    full_name,
    role,
    is_active,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 10) as hash_start
FROM "User" 
WHERE username = 'admin';

-- 7. Probar función auth_login
SELECT 'Probando auth_login:' as test;
SELECT auth_login('admin', 'admin123');

-- 8. Verificar hash manualmente
SELECT 
    'Verificación manual:' as test,
    'admin123' as password,
    CASE 
        WHEN crypt('admin123', (SELECT password_hash FROM "User" WHERE username = 'admin')) = (SELECT password_hash FROM "User" WHERE username = 'admin')
        THEN '✅ CONTRASEÑA CORRECTA'
        ELSE '❌ CONTRASEÑA INCORRECTA'
    END as verification;

-- 9. Otorgar permisos
GRANT EXECUTE ON FUNCTION auth_login(TEXT, TEXT) TO PUBLIC;

-- 10. Verificar permisos
SELECT 
    'Permisos función:' as test,
    grantee,
    privilege_type
FROM information_schema.routine_privileges 
WHERE routine_name = 'auth_login';
