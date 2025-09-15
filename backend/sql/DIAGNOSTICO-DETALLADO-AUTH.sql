-- DIAGNÓSTICO DETALLADO DE AUTENTICACIÓN
-- =====================================================

-- 1. Verificar extensión pgcrypto
SELECT 
    'Extensión pgcrypto:' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') 
        THEN '✅ HABILITADA' 
        ELSE '❌ NO HABILITADA' 
    END as status;

-- 2. Verificar estructura de tabla User
SELECT 
    'Estructura tabla User:' as test,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'User' 
ORDER BY ordinal_position;

-- 3. Verificar usuario admin específicamente
SELECT 
    'Usuario admin:' as test,
    id,
    username,
    email,
    password_hash,
    full_name,
    role,
    is_active,
    "createdAt"
FROM "User" 
WHERE username = 'admin';

-- 4. Verificar función auth_login existe
SELECT 
    'Función auth_login:' as test,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'auth_login';

-- 5. Probar función auth_login directamente
SELECT 'Probando auth_login:' as test;
SELECT auth_login('admin', 'admin123');

-- 6. Verificar hash de contraseña manualmente
SELECT 
    'Verificación manual de contraseña:' as test,
    'admin123' as password_input,
    crypt('admin123', gen_salt('bf')) as new_hash,
    (SELECT password_hash FROM "User" WHERE username = 'admin') as stored_hash,
    CASE 
        WHEN crypt('admin123', (SELECT password_hash FROM "User" WHERE username = 'admin')) = (SELECT password_hash FROM "User" WHERE username = 'admin')
        THEN '✅ CONTRASEÑA CORRECTA'
        ELSE '❌ CONTRASEÑA INCORRECTA'
    END as password_verification;

-- 7. Verificar permisos de la función
SELECT 
    'Permisos función auth_login:' as test,
    grantee,
    privilege_type
FROM information_schema.routine_privileges 
WHERE routine_name = 'auth_login';

-- 8. Probar con diferentes variaciones de usuario
SELECT 'Probando variaciones:' as test;
SELECT 'admin' as username, auth_login('admin', 'admin123') as result
UNION ALL
SELECT 'ADMIN' as username, auth_login('ADMIN', 'admin123') as result
UNION ALL
SELECT 'Admin' as username, auth_login('Admin', 'admin123') as result;

-- 9. Verificar si hay usuarios duplicados
SELECT 
    'Usuarios duplicados:' as test,
    username,
    COUNT(*) as count
FROM "User" 
GROUP BY username 
HAVING COUNT(*) > 1;

-- 10. Verificar todos los usuarios
SELECT 
    'Todos los usuarios:' as test,
    username,
    email,
    role,
    is_active,
    "createdAt"
FROM "User" 
ORDER BY "createdAt";
