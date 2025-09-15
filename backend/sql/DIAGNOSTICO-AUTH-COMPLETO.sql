-- DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN
-- =====================================================

-- 1. Verificar extensión pgcrypto
SELECT 
    'pgcrypto' as extension_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') 
        THEN 'HABILITADA' 
        ELSE 'NO HABILITADA' 
    END as status;

-- 2. Verificar estructura de tabla User
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'User' 
ORDER BY ordinal_position;

-- 3. Verificar usuarios existentes
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
ORDER BY "createdAt";

-- 4. Verificar función auth_login
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'auth_login';

-- 5. Probar función auth_login con admin
SELECT 'Probando auth_login con admin/admin123' as test;
SELECT auth_login('admin', 'admin123');

-- 6. Verificar hash de contraseña
SELECT 
    'admin123' as password_input,
    crypt('admin123', gen_salt('bf')) as new_hash,
    (SELECT password_hash FROM "User" WHERE username = 'admin') as stored_hash,
    CASE 
        WHEN crypt('admin123', (SELECT password_hash FROM "User" WHERE username = 'admin')) = (SELECT password_hash FROM "User" WHERE username = 'admin')
        THEN 'CONTRASEÑA CORRECTA'
        ELSE 'CONTRASEÑA INCORRECTA'
    END as password_verification;

-- 7. Verificar permisos de la función
SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges 
WHERE routine_name = 'auth_login';

-- 8. Crear usuario admin si no existe
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
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = crypt('admin123', gen_salt('bf')),
    "updatedAt" = NOW();

-- 9. Verificar usuario admin después de insertar/actualizar
SELECT 
    'Usuario admin después de insertar/actualizar' as status,
    id,
    username,
    email,
    full_name,
    role,
    is_active
FROM "User" 
WHERE username = 'admin';

-- 10. Probar auth_login final
SELECT 'Prueba final de auth_login' as test;
SELECT auth_login('admin', 'admin123');
