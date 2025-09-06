-- Script para corregir el RPC de combos basado en la estructura real de la tabla
-- La tabla ComboComponent tiene: id, comboId, name, description, type, price, isRequired, isAvailable, maxSelections, ord, createdAt, updatedAt

-- 1. Eliminar el RPC existente
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

-- 2. Crear el RPC corregido
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
    -- Obtener información de los productos seleccionados
    FOR i IN 1..array_length(p_platos_ids, 1) LOOP
      SELECT name, description, price INTO v_product_name, v_product_description, v_product_price
      FROM "Product" 
      WHERE id = p_platos_ids[i];
      
      IF FOUND THEN
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
      SELECT name, description, price INTO v_product_name, v_product_description, v_product_price
      FROM "Product" 
      WHERE id = p_acomp_ids[i];
      
      IF FOUND THEN
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

-- 4. Probar el RPC
-- SELECT combo_create_or_update_basic(
--   'TEST_COMBO_2',
--   'Combo de Prueba 2',
--   35.90,
--   '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff'::uuid,
--   ARRAY['c015c69d-2212-46b4-9594-8d97905b3116'::uuid, '7a929ca7-9cca-41c1-849b-823aa71308b7'::uuid],
--   2,
--   ARRAY[]::uuid[],
--   0,
--   'Combo de prueba corregido',
--   NULL,
--   true,
--   true,
--   25,
--   NULL
-- );





