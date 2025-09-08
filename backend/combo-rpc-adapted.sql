-- =====================================================
-- RPC DE COMBOS ADAPTADO A LA ESTRUCTURA REAL DE LA BD
-- =====================================================
-- La tabla ComboComponent tiene: id, comboId, name, description, type, price, 
-- isRequired, isAvailable, maxSelections, ord, createdAt, updatedAt
-- 
-- NO tiene productId - almacena la información del producto directamente
-- =====================================================

-- 1. Eliminar el RPC existente si existe
DROP FUNCTION IF EXISTS combo_create_or_update_basic(
  p_code text,
  p_name text,
  p_base_price numeric,
  p_category_id uuid,
  p_platos_ids uuid[],
  p_platos_max integer,
  p_acomp_ids uuid[],
  p_acomp_max integer,
  p_description text,
  p_image text,
  p_is_enabled boolean,
  p_is_available boolean,
  p_preparation_time integer,
  p_id uuid
);

-- 2. Crear el RPC adaptado a tu estructura
CREATE OR REPLACE FUNCTION combo_create_or_update_basic(
  p_code text,
  p_name text,
  p_base_price numeric,
  p_category_id uuid,
  p_platos_ids uuid[],
  p_platos_max integer,
  p_acomp_ids uuid[],
  p_acomp_max integer,
  p_description text,
  p_image text,
  p_is_enabled boolean,
  p_is_available boolean,
  p_preparation_time integer,
  p_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_combo_id uuid;
  v_product_name text;
  v_product_description text;
  v_product_price numeric;
  v_ord integer;
BEGIN
  -- Si p_id es NULL, crear nuevo combo
  IF p_id IS NULL THEN
    INSERT INTO "Combo" (
      code, name, description, "basePrice", image, "isEnabled", "isAvailable", 
      "preparationTime", "categoryId", "maxSelections", "createdAt", "updatedAt"
    ) VALUES (
      p_code, p_name, p_description, p_base_price, p_image, p_is_enabled, p_is_available,
      p_preparation_time, p_category_id, p_platos_max, NOW(), NOW()
    ) RETURNING id INTO v_combo_id;
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
      "maxSelections" = p_platos_max,
      "updatedAt" = NOW()
    WHERE id = p_id
    RETURNING id INTO v_combo_id;
    
    IF v_combo_id IS NULL THEN
      RAISE EXCEPTION 'Combo con ID % no encontrado', p_id;
    END IF;
  END IF;

  -- Eliminar componentes existentes del combo
  DELETE FROM "ComboComponent" WHERE "comboId" = v_combo_id;

  -- Crear componentes de platos
  IF p_platos_ids IS NOT NULL AND array_length(p_platos_ids, 1) > 0 THEN
    FOR i IN 1..array_length(p_platos_ids, 1) LOOP
      -- Obtener información del producto desde la tabla Product
      SELECT name, description, price INTO v_product_name, v_product_description, v_product_price
      FROM "Product" 
      WHERE id = p_platos_ids[i];
      
      IF FOUND THEN
        -- Insertar en ComboComponent con la información del producto
        INSERT INTO "ComboComponent" (
          "comboId", name, description, type, price, "isRequired", "isAvailable", 
          "maxSelections", ord, "createdAt", "updatedAt"
        ) VALUES (
          v_combo_id, v_product_name, v_product_description, 'PLATOS', v_product_price,
          true, true, p_platos_max, i, NOW(), NOW()
        );
      END IF;
    END LOOP;
  END IF;

  -- Crear componentes de acompañamiento
  IF p_acomp_ids IS NOT NULL AND array_length(p_acomp_ids, 1) > 0 THEN
    v_ord := 1;
    FOR i IN 1..array_length(p_acomp_ids, 1) LOOP
      -- Obtener información del producto desde la tabla Product
      SELECT name, description, price INTO v_product_name, v_product_description, v_product_price
      FROM "Product" 
      WHERE id = p_acomp_ids[i];
      
      IF FOUND THEN
        -- Insertar en ComboComponent con la información del producto
        INSERT INTO "ComboComponent" (
          "comboId", name, description, type, price, "isRequired", "isAvailable", 
          "maxSelections", ord, "createdAt", "updatedAt"
        ) VALUES (
          v_combo_id, v_product_name, v_product_description, 'ACOMPAÑAMIENTO', v_product_price,
          false, true, p_acomp_max, v_ord, NOW(), NOW()
        );
        v_ord := v_ord + 1;
      END IF;
    END LOOP;
  END IF;

  RETURN v_combo_id;
END;
$$;

-- 3. Verificar que el RPC se creó correctamente
SELECT 
  routine_name, 
  routine_type, 
  data_type 
FROM information_schema.routines 
WHERE routine_name = 'combo_create_or_update_basic';

-- 4. Dar permisos para que el backend pueda ejecutarlo
REVOKE ALL ON FUNCTION combo_create_or_update_basic(
  text, text, numeric, uuid, uuid[], integer, uuid[], integer, 
  text, text, boolean, boolean, integer, uuid
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION combo_create_or_update_basic(
  text, text, numeric, uuid, uuid[], integer, uuid[], integer, 
  text, text, boolean, boolean, integer, uuid
) TO anon, authenticated;

-- 5. Notificar a PostgREST para recargar el esquema
SELECT pg_notify('pgrst','reload schema');

-- =====================================================
-- ¡LISTO! Ahora tu RPC funciona con tu estructura real
-- =====================================================
-- 
-- CÓMO FUNCIONA:
-- 1. Crea/actualiza el combo en la tabla Combo
-- 2. Elimina componentes existentes
-- 3. Obtiene nombre, descripción y precio de Product
-- 4. Los inserta directamente en ComboComponent
-- 5. No necesita columnas que no existen
-- 
-- VENTAJAS:
-- ✅ No hay errores de columnas inexistentes
-- ✅ La información del producto se guarda en el combo
-- ✅ Es más eficiente (no necesita JOINs)
-- ✅ Más flexible para cambios futuros
-- =====================================================






