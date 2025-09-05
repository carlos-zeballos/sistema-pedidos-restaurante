-- =====================================================
-- RPC PARA GESTIÓN DE COMBOS COMPATIBLE CON SISTEMA EXISTENTE
-- =====================================================
-- Este RPC es compatible con el sistema de personalización existente
-- donde cada combo tiene ComboComponent con tipos: SABOR, SALSA, COMPLEMENTO
-- y cada tipo tiene maxSelections que determina cuántos puede elegir el cliente
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

-- Crear el RPC compatible con el sistema existente
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
      IF v_component->>'name' IS NULL OR v_component->>'name' = '' THEN
        RAISE EXCEPTION 'El nombre del componente es requerido';
      END IF;
      
      IF v_component->>'type' IS NULL OR v_component->>'type' NOT IN ('SABOR', 'SALSA', 'COMPLEMENTO') THEN
        RAISE EXCEPTION 'El tipo del componente debe ser SABOR, SALSA o COMPLEMENTO';
      END IF;
      
      -- Insertar el componente
      INSERT INTO "ComboComponent" (
        "comboId", name, description, type, price, "isRequired", 
        "isAvailable", "maxSelections", ord, "createdAt", "updatedAt"
      ) VALUES (
        v_combo_id,
        v_component->>'name',
        COALESCE(v_component->>'description', ''),
        v_component->>'type',
        COALESCE((v_component->>'price')::numeric, 0),
        COALESCE((v_component->>'isRequired')::boolean, false),
        COALESCE((v_component->>'isAvailable')::boolean, true),
        COALESCE((v_component->>'maxSelections')::integer, 1),
        v_ord,
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Componente creado: % (tipo: %, maxSelections: %)', 
        v_component->>'name', 
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

-- =====================================================
-- FUNCIÓN AUXILIAR PARA OBTENER COMBOS CON COMPONENTES
-- =====================================================
-- Esta función es útil para obtener combos con sus componentes
-- de manera estructurada para el frontend

CREATE OR REPLACE FUNCTION get_combo_with_components(p_combo_id uuid)
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
  component_name text,
  component_description text,
  component_type text,
  component_price numeric,
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
    cc.name as component_name,
    cc.description as component_description,
    cc.type as component_type,
    cc.price as component_price,
    cc."isRequired" as component_is_required,
    cc."isAvailable" as component_is_available,
    cc."maxSelections" as component_max_selections,
    cc.ord as component_ord
  FROM "Combo" c
  LEFT JOIN "ComboComponent" cc ON c.id = cc."comboId"
  WHERE c.id = p_combo_id
  ORDER BY cc.ord ASC;
END;
$$;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================
-- 
-- USO DEL RPC:
-- 
-- 1. Crear un combo nuevo:
-- SELECT combo_create_or_update_with_components(
--   'COMBO001',                    -- p_code
--   'Nakama',                      -- p_name
--   25.00,                         -- p_base_price
--   'uuid-de-categoria',           -- p_category_id
--   'Combo de 4 makis',            -- p_description
--   'imagen.jpg',                  -- p_image
--   true,                          -- p_is_enabled
--   true,                          -- p_is_available
--   20,                            -- p_preparation_time
--   4,                             -- p_max_selections
--   '[                             -- p_components
--     {
--       "name": "Acevichado",
--       "type": "SABOR",
--       "maxSelections": 4,
--       "isRequired": true,
--       "isAvailable": true
--     },
--     {
--       "name": "California",
--       "type": "SABOR", 
--       "maxSelections": 4,
--       "isRequired": true,
--       "isAvailable": true
--     },
--     {
--       "name": "Acevichada",
--       "type": "SALSA",
--       "maxSelections": 2,
--       "isRequired": true,
--       "isAvailable": true
--     },
--     {
--       "name": "Palito de sushi",
--       "type": "COMPLEMENTO",
--       "maxSelections": 2,
--       "isRequired": false,
--       "isAvailable": true
--     }
--   ]'::jsonb,
--   NULL                            -- p_id (NULL para crear nuevo)
-- );
--
-- 2. Actualizar un combo existente:
-- SELECT combo_create_or_update_with_components(
--   'COMBO001',                    -- p_code
--   'Nakama Actualizado',          -- p_name
--   30.00,                         -- p_base_price
--   'uuid-de-categoria',           -- p_category_id
--   'Combo actualizado',           -- p_description
--   'nueva-imagen.jpg',            -- p_image
--   true,                          -- p_is_enabled
--   true,                          -- p_is_available
--   25,                            -- p_preparation_time
--   4,                             -- p_max_selections
--   '[...componentes...]'::jsonb,  -- p_components
--   'uuid-del-combo'               -- p_id (ID del combo a actualizar)
-- );
--
-- 3. Obtener combo con componentes:
-- SELECT * FROM get_combo_with_components('uuid-del-combo');
--
-- COMPATIBILIDAD:
-- - Compatible con ComboCustomizationModal.tsx
-- - Compatible con el sistema de personalización existente
-- - Los componentes se organizan por tipo: SABOR, SALSA, COMPLEMENTO
-- - Cada tipo tiene maxSelections que determina cuántos puede elegir el cliente
-- - Funciona con el sistema de creación de órdenes existente
--
-- =====================================================

