-- =====================================================
-- RPC PARA CREAR/ACTUALIZAR COMBOS CON COMPONENTES
-- =====================================================

-- Eliminar el RPC existente si existe
DROP FUNCTION IF EXISTS combo_create_or_update_with_components(
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
  p_id uuid
);

-- Crear el nuevo RPC que maneja componentes
CREATE OR REPLACE FUNCTION combo_create_or_update_with_components(
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
BEGIN
  -- Si p_id es NULL, crear nuevo combo
  IF p_id IS NULL THEN
    INSERT INTO "Combo" (
      code, name, description, "basePrice", image, "isEnabled", "isAvailable", 
      "preparationTime", "categoryId", "maxSelections", "createdAt", "updatedAt"
    ) VALUES (
      p_code, p_name, p_description, p_base_price, p_image, p_is_enabled, p_is_available,
      p_preparation_time, p_category_id, p_max_selections, NOW(), NOW()
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
      "maxSelections" = p_max_selections,
      "updatedAt" = NOW()
    WHERE id = p_id
    RETURNING id INTO v_combo_id;
    
    IF v_combo_id IS NULL THEN
      RAISE EXCEPTION 'Combo con ID % no encontrado', p_id;
    END IF;
  END IF;

  -- Eliminar componentes existentes del combo
  DELETE FROM "ComboComponent" WHERE "comboId" = v_combo_id;

  -- Crear nuevos componentes si se proporcionan
  IF p_components IS NOT NULL AND jsonb_array_length(p_components) > 0 THEN
    v_ord := 1;
    
    FOR v_component IN SELECT * FROM jsonb_array_elements(p_components)
    LOOP
      INSERT INTO "ComboComponent" (
        "comboId", name, description, type, price, "isRequired", 
        "isAvailable", "maxSelections", ord, "createdAt", "updatedAt"
      ) VALUES (
        v_combo_id,
        v_component->>'name',
        v_component->>'description',
        v_component->>'type',
        COALESCE((v_component->>'price')::numeric, 0),
        COALESCE((v_component->>'isRequired')::boolean, false),
        COALESCE((v_component->>'isAvailable')::boolean, true),
        COALESCE((v_component->>'maxSelections')::integer, 1),
        v_ord,
        NOW(),
        NOW()
      );
      
      v_ord := v_ord + 1;
    END LOOP;
  END IF;

  RETURN v_combo_id;
END;
$$;










