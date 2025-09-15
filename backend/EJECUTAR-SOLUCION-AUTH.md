# SOLUCIÓN PARA EL PROBLEMA DE AUTENTICACIÓN

## 🔍 **Problema Identificado:**
El usuario `admin` con contraseña `admin123` no puede iniciar sesión porque:
1. El usuario admin no existe en la base de datos, o
2. La contraseña no coincide con el hash almacenado, o
3. Hay un problema con la función `auth_login`

## 🛠️ **Solución:**

### **Paso 1: Ejecutar el script SQL en Supabase**

1. Ve a tu panel de Supabase
2. Ve a la sección "SQL Editor"
3. Ejecuta el siguiente script:

```sql
-- SOLUCIÓN DEFINITIVA PARA EL USUARIO ADMIN
-- =====================================================

-- 1. Habilitar extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Eliminar usuario admin existente (si existe)
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
    'Usuario admin creado:' as status,
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
SELECT 'Probando auth_login:' as test;
SELECT auth_login('admin', 'admin123');
```

### **Paso 2: Verificar el resultado**

Después de ejecutar el script, deberías ver:
- Un usuario admin creado
- La función `auth_login` devolviendo los datos del usuario

### **Paso 3: Probar el login**

1. Ve a la aplicación frontend
2. Intenta hacer login con:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

## 🔧 **Si el problema persiste:**

### **Verificar la función auth_login:**
```sql
-- Verificar que la función existe
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'auth_login';

-- Verificar permisos
SELECT grantee, privilege_type FROM information_schema.routine_privileges WHERE routine_name = 'auth_login';
```

### **Verificar la extensión pgcrypto:**
```sql
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';
```

## 📞 **Contacto:**
Si necesitas ayuda adicional, proporciona:
1. El resultado del script SQL
2. Cualquier error que aparezca
3. Screenshots del panel de Supabase
