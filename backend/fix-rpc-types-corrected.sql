-- =====================================================
-- CORRECCIÓN DE TIPOS EN FUNCIÓN RPC - VERSIÓN CORREGIDA
-- =====================================================

-- 1. Eliminar la función existente primero
DROP FUNCTION IF EXISTS public.get_products_for_combo_components(uuid);

-- 2. Crear la función con los tipos correctos
CREATE OR REPLACE FUNCTION public.get_products_for_combo_components(p_category_id uuid DEFAULT NULL)
RETURNS TABLE (
  product_id uuid,
  product_code character varying,
  product_name character varying,
  product_price numeric(10,2),
  product_description text,
  product_category_id uuid,
  product_category_name character varying,
  product_is_enabled boolean,
  product_is_available boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.code,
    p.name,
    p.price::numeric(10,2),
    p.description,
    p."categoryId",
    c.name,
    p."isEnabled",
    p."isAvailable"
  FROM "Product" p
  LEFT JOIN "Category" c ON c.id = p."categoryId"
  WHERE p."isEnabled" = TRUE
    AND p."isAvailable" = TRUE
    AND (p_category_id IS NULL OR p."categoryId" = p_category_id)
  ORDER BY c.name NULLS LAST, p.name;
END;
$$;

-- 3. Restaurar permisos
REVOKE ALL ON FUNCTION public.get_products_for_combo_components(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_products_for_combo_components(uuid) TO anon, authenticated;

-- 4. Recargar esquema en PostgREST
SELECT pg_notify('pgrst','reload schema');




