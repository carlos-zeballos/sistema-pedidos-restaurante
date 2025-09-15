-- PRUEBA DIRECTA DE LA FUNCIÓN AUTH_LOGIN
-- =====================================================

-- 1. Verificar que la función existe y sus parámetros
SELECT 
    routine_name,
    parameter_name,
    data_type,
    parameter_mode
FROM information_schema.parameters 
WHERE routine_name = 'auth_login'
ORDER BY ordinal_position;

-- 2. Probar la función con diferentes combinaciones
SELECT 'Probando auth_login con admin/admin123:' as test;
SELECT auth_login('admin', 'admin123');

SELECT 'Probando auth_login con ADMIN/admin123:' as test;
SELECT auth_login('ADMIN', 'admin123');

SELECT 'Probando auth_login con admin/ADMIN123:' as test;
SELECT auth_login('admin', 'ADMIN123');

-- 3. Verificar el contenido exacto de la tabla User
SELECT 
    'Contenido exacto tabla User:' as test,
    username,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 10) as hash_start,
    is_active
FROM "User" 
WHERE username IN ('admin', 'ADMIN', 'Admin');

-- 4. Probar creación de hash manual
SELECT 
    'Creación manual de hash:' as test,
    'admin123' as password,
    crypt('admin123', gen_salt('bf')) as new_hash,
    crypt('admin123', crypt('admin123', gen_salt('bf'))) = crypt('admin123', gen_salt('bf')) as verification;

-- 5. Verificar si el problema está en la función auth_login
-- Crear una función de prueba simple
CREATE OR REPLACE FUNCTION test_auth_login(
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
    WHERE u.username = username_param 
    AND u.password_hash = crypt(password_param, u.password_hash)
    AND u.is_active = true;
END;
$$;

-- 6. Probar la función de prueba
SELECT 'Probando función de prueba:' as test;
SELECT test_auth_login('admin', 'admin123');

-- 7. Limpiar función de prueba
DROP FUNCTION test_auth_login(TEXT, TEXT);
