-- =========================================================
-- VERIFICAR DATOS DE LA BASE DE DATOS
-- =========================================================
-- Este script verifica qué espacios y usuarios existen
-- para usar IDs válidos en las pruebas
-- =========================================================

-- 1. Verificar espacios disponibles
SELECT 
    id,
    name,
    status,
    "createdAt"
FROM "Space" 
ORDER BY "createdAt" DESC
LIMIT 10;

-- 2. Verificar usuarios disponibles
SELECT 
    id,
    username,
    email,
    "createdAt"
FROM "User" 
ORDER BY "createdAt" DESC
LIMIT 10;

-- 3. Verificar estructura de la tabla Product
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Product' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar estructura de la tabla Combo
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Combo' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar productos disponibles (solo id y name)
SELECT 
    id,
    name
FROM "Product" 
LIMIT 5;

-- 6. Verificar combos disponibles (solo id y name)
SELECT 
    id,
    name
FROM "Combo" 
LIMIT 5;

-- 7. Contar registros por tabla
SELECT 
    'Space' as tabla,
    COUNT(*) as total
FROM "Space"
UNION ALL
SELECT 
    'User' as tabla,
    COUNT(*) as total
FROM "User"
UNION ALL
SELECT 
    'Product' as tabla,
    COUNT(*) as total
FROM "Product"
UNION ALL
SELECT 
    'Combo' as tabla,
    COUNT(*) as total
FROM "Combo"
UNION ALL
SELECT 
    'Order' as tabla,
    COUNT(*) as total
FROM "Order";
