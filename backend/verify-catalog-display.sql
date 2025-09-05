-- =====================================================
-- VERIFICACIÓN COMPLETA DEL CATÁLOGO
-- =====================================================
-- Este script verifica que todos los productos estén configurados correctamente
-- para mostrarse en el frontend

-- 1. VERIFICAR CATEGORÍAS ACTIVAS
SELECT 
  'CATEGORÍAS' as tipo,
  name,
  "isActive",
  ord
FROM "Category" 
WHERE "isActive" = true
ORDER BY ord;

-- 2. VERIFICAR PRODUCTOS POR CATEGORÍA
SELECT 
  c.name as categoria,
  COUNT(p.id) as total_productos,
  COUNT(CASE WHEN p."isEnabled" = true THEN 1 END) as habilitados,
  COUNT(CASE WHEN p."isAvailable" = true THEN 1 END) as disponibles,
  COUNT(CASE WHEN p.price > 0 THEN 1 END) as con_precio,
  COUNT(CASE WHEN p.price = 0 THEN 1 END) as sin_precio
FROM "Category" c
LEFT JOIN "Product" p ON p."categoryId" = c.id
WHERE c."isActive" = true
GROUP BY c.id, c.name, c.ord
ORDER BY c.ord;

-- 3. VERIFICAR PRODUCTOS PROBLEMÁTICOS (que no se mostrarán)
SELECT 
  'PRODUCTOS PROBLEMÁTICOS' as tipo,
  p.code,
  p.name,
  c.name as categoria,
  p.price,
  p."isEnabled",
  p."isAvailable",
  CASE 
    WHEN p.price = 0 THEN 'Precio 0'
    WHEN p."isEnabled" = false THEN 'Deshabilitado'
    WHEN p."isAvailable" = false THEN 'No disponible'
    ELSE 'OK'
  END as problema
FROM "Product" p
JOIN "Category" c ON p."categoryId" = c.id
WHERE c."isActive" = true 
  AND (p.price = 0 OR p."isEnabled" = false OR p."isAvailable" = false)
ORDER BY c.name, p.name;

-- 4. VERIFICAR PRODUCTOS QUE SÍ SE MOSTRARÁN
SELECT 
  'PRODUCTOS VISIBLES' as tipo,
  c.name as categoria,
  p.code,
  p.name,
  p.price,
  p.type
FROM "Product" p
JOIN "Category" c ON p."categoryId" = c.id
WHERE c."isActive" = true 
  AND p.price > 0 
  AND p."isEnabled" = true 
  AND p."isAvailable" = true
ORDER BY c.ord, p.name;

-- 5. VERIFICAR ESPECÍFICAMENTE MAKIS CLÁSICOS
SELECT 
  'MAKIS CLÁSICOS - ESTADO ACTUAL' as tipo,
  p.code,
  p.name,
  p.price,
  p."isEnabled",
  p."isAvailable",
  CASE 
    WHEN p.price > 0 AND p."isEnabled" = true AND p."isAvailable" = true 
    THEN '✅ VISIBLE'
    ELSE '❌ NO VISIBLE'
  END as estado
FROM "Product" p
JOIN "Category" c ON p."categoryId" = c.id
WHERE c.name = 'MAKIS CLÁSICOS'
ORDER BY p.name;

-- 6. VERIFICAR ENDPOINTS PÚBLICOS
-- (Esto verifica que los endpoints del backend devuelvan datos)
SELECT 
  'VERIFICACIÓN ENDPOINTS' as tipo,
  'GET /catalog/public/categories' as endpoint,
  (SELECT COUNT(*) FROM "Category" WHERE "isActive" = true) as categorias_activas;

SELECT 
  'VERIFICACIÓN ENDPOINTS' as tipo,
  'GET /catalog/public/products' as endpoint,
  (SELECT COUNT(*) FROM "Product" p 
   JOIN "Category" c ON p."categoryId" = c.id 
   WHERE c."isActive" = true 
     AND p."isEnabled" = true 
     AND p."isAvailable" = true) as productos_visibles;
