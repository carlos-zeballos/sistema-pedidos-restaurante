-- =====================================================
-- SISTEMA SAAS - COMBOS CONECTADOS CON PRODUCTOS
-- =====================================================
-- Este sistema conecta combos con productos existentes
-- Perfecto para un SAAS de restaurantes
-- =====================================================

-- 1. Modificar la tabla ComboComponent para conectar con Product
ALTER TABLE "ComboComponent" 
ADD COLUMN IF NOT EXISTS "productId" UUID REFERENCES "Product"(id) ON DELETE CASCADE;

-- 2. Crear función RPC para combos conectados con productos
CREATE OR REPLACE FUNCTION combo_create_or_update_with_products(
  p_code text,
  p_name text,
  p_base_price numeric,
  p_category_id uuid,
  p_description text,
  p_image text,
  p_is_enabled boolean,
  p_is_available boolean,
  p_preparation_time integer,
  p_max_selections integer,
  p_components jsonb,
  p_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_combo_id uuid;
  v_component jsonb;
  v_ord integer;
  v_product_id uuid;
  v_product_name text;
  v_product_price numeric;
BEGIN
  -- Validaciones básicas
  IF p_code IS NULL OR p_code = '' THEN
    RAISE EXCEPTION 'El código del combo es requerido';
  END IF;
  
  IF p_name IS NULL OR p_name = '' THEN
    RAISE EXCEPTION 'El nombre del combo es requerido';
  END IF;
  
  IF p_base_price IS NULL OR p_base_price <= 0 THEN
    RAISE EXCEPTION 'El precio base debe ser mayor a 0';
  END IF;
  
  IF p_category_id IS NULL THEN
    RAISE EXCEPTION 'La categoría es requerida';
  END IF;
  
  -- Verificar que la categoría existe
  IF NOT EXISTS (SELECT 1 FROM "Category" WHERE id = p_category_id AND "isActive" = true) THEN
    RAISE EXCEPTION 'La categoría % no existe o no está activa', p_category_id;
  END IF;

  -- Si p_id es NULL, crear nuevo combo
  IF p_id IS NULL THEN
    -- Verificar que el código no existe
    IF EXISTS (SELECT 1 FROM "Combo" WHERE code = p_code) THEN
      RAISE EXCEPTION 'Ya existe un combo con el código %', p_code;
    END IF;
    
    INSERT INTO "Combo" (
      code, name, description, "basePrice", image, "isEnabled", "isAvailable", 
      "preparationTime", "categoryId", "maxSelections", "createdAt", "updatedAt"
    ) VALUES (
      p_code, p_name, p_description, p_base_price, p_image, p_is_enabled, p_is_available,
      p_preparation_time, p_category_id, p_max_selections, NOW(), NOW()
    ) RETURNING id INTO v_combo_id;
    
    RAISE NOTICE 'Combo creado con ID: %', v_combo_id;
  ELSE
    -- Actualizar combo existente
    UPDATE "Combo" SET
      code = p_code,
      name = p_name,
      description = p_description,
      "basePrice" = p_base_price,
      image = p_image,
      "isEnabled" = p_is_enabled,
      "isAvailable" = p_is_available,
      "preparationTime" = p_preparation_time,
      "categoryId" = p_category_id,
      "maxSelections" = p_max_selections,
      "updatedAt" = NOW()
    WHERE id = p_id
    RETURNING id INTO v_combo_id;
    
    IF v_combo_id IS NULL THEN
      RAISE EXCEPTION 'Combo con ID % no encontrado', p_id;
    END IF;
    
    RAISE NOTICE 'Combo actualizado con ID: %', v_combo_id;
  END IF;

  -- Eliminar componentes existentes del combo
  DELETE FROM "ComboComponent" WHERE "comboId" = v_combo_id;
  RAISE NOTICE 'Componentes existentes eliminados para el combo %', v_combo_id;

  -- Crear nuevos componentes si se proporcionan
  IF p_components IS NOT NULL AND jsonb_array_length(p_components) > 0 THEN
    v_ord := 1;
    
    FOR v_component IN SELECT * FROM jsonb_array_elements(p_components)
    LOOP
      -- Validar que el componente tenga los campos requeridos
      IF v_component->>'productId' IS NULL THEN
        RAISE EXCEPTION 'El productId del componente es requerido';
      END IF;
      
      IF v_component->>'type' IS NULL OR v_component->>'type' NOT IN ('SABOR', 'SALSA', 'COMPLEMENTO', 'PLATO', 'ACOMPAÑAMIENTO') THEN
        RAISE EXCEPTION 'El tipo del componente debe ser SABOR, SALSA, COMPLEMENTO, PLATO o ACOMPAÑAMIENTO';
      END IF;
      
      -- Obtener información del producto
      v_product_id := (v_component->>'productId')::uuid;
      
      SELECT name, price INTO v_product_name, v_product_price
      FROM "Product" 
      WHERE id = v_product_id AND "isEnabled" = true AND "isAvailable" = true;
      
      IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto con ID % no existe, no está habilitado o no disponible', v_product_id;
      END IF;
      
      -- Insertar el componente conectado al producto
      INSERT INTO "ComboComponent" (
        "comboId", "productId", name, description, type, price, "isRequired", 
        "isAvailable", "maxSelections", ord, "createdAt", "updatedAt"
      ) VALUES (
        v_combo_id,
        v_product_id,
        v_product_name,
        COALESCE(v_component->>'description', ''),
        v_component->>'type',
        v_product_price,
        COALESCE((v_component->>'isRequired')::boolean, false),
        COALESCE((v_component->>'isAvailable')::boolean, true),
        COALESCE((v_component->>'maxSelections')::integer, 1),
        v_ord,
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Componente creado: % (productId: %, tipo: %, maxSelections: %)', 
        v_product_name, 
        v_product_id,
        v_component->>'type', 
        COALESCE((v_component->>'maxSelections')::integer, 1);
      
      v_ord := v_ord + 1;
    END LOOP;
    
    RAISE NOTICE 'Total de componentes creados: %', jsonb_array_length(p_components);
  ELSE
    RAISE NOTICE 'No se proporcionaron componentes para el combo';
  END IF;

  RETURN v_combo_id;
END;
$$;

-- 3. Función para obtener combos con productos
CREATE OR REPLACE FUNCTION get_combo_with_products(p_combo_id uuid)
RETURNS TABLE (
  combo_id uuid,
  combo_code text,
  combo_name text,
  combo_description text,
  combo_base_price numeric,
  combo_image text,
  combo_is_enabled boolean,
  combo_is_available boolean,
  combo_preparation_time integer,
  combo_category_id uuid,
  combo_max_selections integer,
  component_id uuid,
  product_id uuid,
  product_name text,
  product_price numeric,
  product_code text,
  product_description text,
  component_type text,
  component_is_required boolean,
  component_is_available boolean,
  component_max_selections integer,
  component_ord integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as combo_id,
    c.code as combo_code,
    c.name as combo_name,
    c.description as combo_description,
    c."basePrice" as combo_base_price,
    c.image as combo_image,
    c."isEnabled" as combo_is_enabled,
    c."isAvailable" as combo_is_available,
    c."preparationTime" as combo_preparation_time,
    c."categoryId" as combo_category_id,
    c."maxSelections" as combo_max_selections,
    cc.id as component_id,
    cc."productId" as product_id,
    p.name as product_name,
    p.price as product_price,
    p.code as product_code,
    p.description as product_description,
    cc.type as component_type,
    cc."isRequired" as component_is_required,
    cc."isAvailable" as component_is_available,
    cc."maxSelections" as component_max_selections,
    cc.ord as component_ord
  FROM "Combo" c
  LEFT JOIN "ComboComponent" cc ON c.id = cc."comboId"
  LEFT JOIN "Product" p ON cc."productId" = p.id
  WHERE c.id = p_combo_id
  ORDER BY cc.ord ASC;
END;
$$;

-- 4. Función para obtener productos disponibles por categoría para combos
CREATE OR REPLACE FUNCTION get_products_for_combo_components(p_category_id uuid DEFAULT NULL)
RETURNS TABLE (
  product_id uuid,
  product_code text,
  product_name text,
  product_price numeric,
  product_description text,
  product_category_id uuid,
  product_category_name text,
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

-- 5. Trigger para actualizar componentes cuando se actualiza un producto
CREATE OR REPLACE FUNCTION update_combo_component_on_product_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar componentes de combo cuando se actualiza un producto
  UPDATE "ComboComponent" 
  SET 
    name = NEW.name,
    price = NEW.price,
    "isAvailable" = NEW."isAvailable",
    "updatedAt" = NOW()
  WHERE "productId" = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_update_combo_component_on_product_change ON "Product";
CREATE TRIGGER trigger_update_combo_component_on_product_change
  AFTER UPDATE ON "Product"
  FOR EACH ROW
  EXECUTE FUNCTION update_combo_component_on_product_change();

-- 6. Función para reportes - productos más vendidos en combos
CREATE OR REPLACE FUNCTION get_most_sold_products_in_combos(p_start_date date DEFAULT NULL, p_end_date date DEFAULT NULL)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  product_code text,
  total_quantity bigint,
  total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    p.code as product_code,
    SUM(oic.quantity) as total_quantity,
    SUM(oic.quantity * oic.price) as total_revenue
  FROM "Product" p
  JOIN "ComboComponent" cc ON p.id = cc."productId"
  JOIN "OrderItemComponent" oic ON cc.id = oic."comboComponentId"
  JOIN "OrderItem" oi ON oic."orderItemId" = oi.id
  JOIN "Order" o ON oi."orderId" = o.id
  WHERE o.status = 'PAGADO'
    AND (p_start_date IS NULL OR o."createdAt"::date >= p_start_date)
    AND (p_end_date IS NULL OR o."createdAt"::date <= p_end_date)
  GROUP BY p.id, p.name, p.code
  ORDER BY total_quantity DESC;
END;
$$;

-- =====================================================
-- EJEMPLO DE USO - CREAR COMBO CON PRODUCTOS REALES
-- =====================================================

-- Primero, necesitamos obtener los IDs de productos existentes
-- Ejemplo: Crear combo "Nakama" usando productos reales

/*
-- 1. Obtener productos disponibles para combos
SELECT * FROM get_products_for_combo_components();

-- 2. Crear combo usando productos reales
SELECT combo_create_or_update_with_products(
  'C-NAKAMA_SAAS',
  'Nakama SAAS',
  47.9,
  '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
  'Combo de 4 makis usando productos reales',
  'nakama-saas.jpg',
  true,
  true,
  20,
  4,
  '[
    {
      "productId": "uuid-del-producto-acevichado",
      "type": "SABOR",
      "maxSelections": 4,
      "isRequired": true,
      "isAvailable": true
    },
    {
      "productId": "uuid-del-producto-california", 
      "type": "SABOR",
      "maxSelections": 4,
      "isRequired": true,
      "isAvailable": true
    },
    {
      "productId": "uuid-del-producto-salsa-acevichada",
      "type": "SALSA",
      "maxSelections": 2,
      "isRequired": true,
      "isAvailable": true
    }
  ]'::jsonb,
  NULL
);

-- 3. Obtener combo con productos
SELECT * FROM get_combo_with_products('uuid-del-combo');

-- 4. Reporte de productos más vendidos en combos
SELECT * FROM get_most_sold_products_in_combos('2024-01-01', '2024-12-31');
*/

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================
-- 
-- SISTEMA SAAS COMPLETO:
-- 
-- 1. COMBOS CONECTADOS: Los combos usan productos reales existentes
-- 2. SINCRONIZACIÓN AUTOMÁTICA: Cuando se actualiza un producto, se actualiza en combos
-- 3. REPORTES INTEGRADOS: Reportes de productos más vendidos en combos
-- 4. ESCALABILIDAD: Funciona para cualquier restaurante
-- 5. CONSISTENCIA: Todo está conectado y sincronizado
-- 
-- BENEFICIOS PARA SAAS:
-- - ✅ Datos unificados
-- - ✅ Reportes precisos
-- - ✅ Mantenimiento automático
-- - ✅ Escalabilidad
-- - ✅ Profesionalismo
-- 
-- =====================================================










