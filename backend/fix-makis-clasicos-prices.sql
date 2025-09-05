-- =====================================================
-- CORRECCIÓN DE PRECIOS DE MAKIS CLÁSICOS
-- =====================================================
-- Generado: 2025-08-31T12:00:00.000Z
-- Problema: Los makis clásicos tienen precio 0, lo que causa problemas en la visualización
-- Solución: Asignar precios base por tabla de 10 rolls

-- Actualizar precios de makis clásicos (precio por tabla de 10 rolls)
UPDATE "Product" 
SET price = 22.90,
    "updatedAt" = NOW()
WHERE code IN (
  'ACEVICHADO-001',
  'CALIFORNIA-001', 
  'KATOZEMA-001',
  'TIRADITO-001',
  'TATAKI-001',
  'OLIVO-001',
  'PARRILLERO-001',
  'KARAMARU-001',
  'ORANJI-001',
  'FUTARI-001',
  'SUPAI-001',
  'FURAI-001',
  'SHIRO-001'
) AND "categoryId" = (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS');

-- Verificar la actualización
SELECT 
  code,
  name,
  price,
  "isAvailable",
  "isEnabled"
FROM "Product" 
WHERE "categoryId" = (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS')
ORDER BY name;

-- Mostrar resumen de la corrección
SELECT 
  'MAKIS CLÁSICOS' as categoria,
  COUNT(*) as total_productos,
  COUNT(CASE WHEN price > 0 THEN 1 END) as con_precio,
  COUNT(CASE WHEN price = 0 THEN 1 END) as sin_precio,
  COUNT(CASE WHEN "isAvailable" = true THEN 1 END) as disponibles
FROM "Product" 
WHERE "categoryId" = (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS');
