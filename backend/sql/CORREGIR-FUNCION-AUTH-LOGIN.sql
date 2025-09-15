-- CORREGIR FUNCIÓN AUTH_LOGIN - SOLUCIONAR AMBIGÜEDAD
-- =====================================================

-- 1. Eliminar función auth_login existente
DROP FUNCTION IF EXISTS auth_login(TEXT, TEXT);

-- 2. Recrear función auth_login SIN ambigüedad
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
DECLARE
    user_record RECORD;
    password_match BOOLEAN;
BEGIN
    -- Buscar usuario usando alias de tabla para evitar ambigüedad
    SELECT * INTO user_record
    FROM "User" u
    WHERE u.username = p_username 
    AND u.is_active = true;
    
    -- Verificar si se encontró el usuario
    IF NOT FOUND THEN
        RAISE NOTICE 'Usuario no encontrado: %', p_username;
        RETURN;
    END IF;
    
    -- Verificar contraseña
    password_match := (user_record.password_hash = crypt(p_password, user_record.password_hash));
    
    IF password_match THEN
        RAISE NOTICE 'Login exitoso para usuario: %', p_username;
        RETURN QUERY
        SELECT 
            user_record.id,
            user_record.username,
            user_record.email,
            user_record.full_name,
            user_record.role,
            user_record.is_active;
    ELSE
        RAISE NOTICE 'Contraseña incorrecta para usuario: %', p_username;
        RETURN;
    END IF;
END;
$$;

-- 3. Otorgar permisos
GRANT EXECUTE ON FUNCTION auth_login(TEXT, TEXT) TO PUBLIC;

-- 4. Verificar que la función se creó correctamente
SELECT 
    'Función auth_login recreada:' as status,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'auth_login';

-- 5. Probar la función corregida
SELECT 'Probando función corregida:' as test;
SELECT auth_login('admin', 'admin123');

-- 6. Verificar usuario admin existe
SELECT 
    'Usuario admin:' as status,
    username,
    email,
    role,
    is_active
FROM "User" 
WHERE username = 'admin';
