-- =====================================================
-- CORRECCIÓN DE FUNCIÓN get_products_for_combo_components
-- =====================================================

-- Corregir tipos de retorno de la función
CREATE OR REPLACE FUNCTION get_products_for_combo_components(p_category_id uuid DEFAULT NULL)
RETURNS TABLE (
  product_id uuid,
  product_code character varying,
  product_name character varying,
  product_price numeric,
  product_description character varying,
  product_category_id uuid,
  product_category_name character varying,
  product_is_enabled boolean,
  product_is_available boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.code as product_code,
    p.name as product_name,
    p.price as product_price,
    p.description as product_description,
    p."categoryId" as product_category_id,
    cat.name as product_category_name,
    p."isEnabled" as product_is_enabled,
    p."isAvailable" as product_is_available
  FROM "Product" p
  LEFT JOIN "Category" cat ON p."categoryId" = cat.id
  WHERE p."isEnabled" = true 
    AND p."isAvailable" = true
    AND (p_category_id IS NULL OR p."categoryId" = p_category_id)
  ORDER BY cat.name, p.name;
END;
$$;









