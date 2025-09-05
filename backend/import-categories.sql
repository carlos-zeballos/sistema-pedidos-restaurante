-- =====================================================
-- IMPORTACIÓN DE CATEGORÍAS DEL MENÚ
-- =====================================================
-- Generado: 2025-08-31T11:02:54.733Z

-- 1. ENTRADAS
SELECT public.category_upsert(
  p_name := 'ENTRADAS',
  p_ord := 1,
  p_description := 'Platos de entrada japoneses y nikkei',
  p_image := NULL,
  p_is_active := true
) AS category_1_id;

-- 2. PLATOS INDIVIDUALES
SELECT public.category_upsert(
  p_name := 'PLATOS INDIVIDUALES',
  p_ord := 2,
  p_description := 'Platos principales individuales',
  p_image := NULL,
  p_is_active := true
) AS category_2_id;

-- 3. COMBOS Y PAQUETES
SELECT public.category_upsert(
  p_name := 'COMBOS Y PAQUETES',
  p_ord := 3,
  p_description := 'Combos y paquetes especiales',
  p_image := NULL,
  p_is_active := true
) AS category_3_id;

-- 4. MAKIS CLÁSICOS
SELECT public.category_upsert(
  p_name := 'MAKIS CLÁSICOS',
  p_ord := 4,
  p_description := 'Rolls de sushi clásicos (tabla de 10)',
  p_image := NULL,
  p_is_active := true
) AS category_4_id;

-- 5. MAKIS KUREIZI
SELECT public.category_upsert(
  p_name := 'MAKIS KUREIZI',
  p_ord := 5,
  p_description := 'Rolls de sushi creativos (tabla de 10)',
  p_image := NULL,
  p_is_active := true
) AS category_5_id;

-- 6. ADICIONALES
SELECT public.category_upsert(
  p_name := 'ADICIONALES',
  p_ord := 6,
  p_description := 'Productos adicionales y extras',
  p_image := NULL,
  p_is_active := true
) AS category_6_id;

-- 7. SALSAS
SELECT public.category_upsert(
  p_name := 'SALSAS',
  p_ord := 7,
  p_description := 'Salsas disponibles para acompañar',
  p_image := NULL,
  p_is_active := true
) AS category_7_id;

-- 8. Acompañamientos
SELECT public.category_upsert(
  p_name := 'Acompañamientos',
  p_ord := 8,
  p_description := 'Productos de acompañamiento para combos',
  p_image := NULL,
  p_is_active := true
) AS category_8_id;

-- =====================================================
-- VERIFICACIÓN DE CATEGORÍAS CREADAS
-- =====================================================
SELECT 
  id,
  name,
  ord,
  description,
  "isActive",
  "createdAt"
FROM "Category" 
WHERE "isActive" = true 
ORDER BY ord;

