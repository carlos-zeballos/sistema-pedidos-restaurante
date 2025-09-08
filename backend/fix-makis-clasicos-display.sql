BEGIN;

-- 1) Por CATEGORÍA (case-insensitive)
WITH cat AS (
  SELECT id
  FROM "Category"
  WHERE lower(name) = lower('Makis clásicos')
  LIMIT 1
)
UPDATE "Product" p
SET price = 25.90,
    "isEnabled" = TRUE,
    "isAvailable" = TRUE,
    "updatedAt" = NOW()
FROM cat
WHERE p."categoryId" = cat.id
  AND (p.price IS NULL OR p.price = 0);

-- 2) Por CÓDIGO (fallback por si algún clásico no quedó en la categoría)
UPDATE "Product"
SET price = 25.90,
    "isEnabled" = TRUE,
    "isAvailable" = TRUE,
    "updatedAt" = NOW()
WHERE code ILIKE 'MKC-%'
  AND (price IS NULL OR price = 0);

-- 3) Verificación rápida
SELECT 'RESUMEN MAKIS CLÁSICOS' AS label,
       COUNT(*) FILTER (WHERE price = 25.90) AS con_precio_25_90,
       COUNT(*) FILTER (WHERE "isEnabled")   AS habilitados,
       COUNT(*) FILTER (WHERE "isAvailable") AS disponibles
FROM "Product"
WHERE (code ILIKE 'MKC-%'
   OR  "categoryId" = (SELECT id FROM "Category" WHERE lower(name)=lower('Makis clásicos')))
  AND price > 0;

-- 4) Listado para comprobar en UI
SELECT code, name, price, "isEnabled", "isAvailable"
FROM "Product"
WHERE (code ILIKE 'MKC-%'
   OR  "categoryId" = (SELECT id FROM "Category" WHERE lower(name)=lower('Makis clásicos')))
ORDER BY name;

-- 5) Refrescar caché de la API (Supabase)
SELECT pg_notify('pgrst','reload schema');

COMMIT;






