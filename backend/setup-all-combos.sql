-- =====================================================
-- CONFIGURACIÓN COMPLETA DE TODOS LOS COMBOS EXISTENTES
-- =====================================================
-- Este SQL configura todos los combos existentes con sus componentes
-- basado en la estructura actual de tu base de datos
-- =====================================================

-- Primero, aplicar la función RPC si no existe
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
      
      IF v_component->>'type' IS NULL OR v_component->>'type' NOT IN ('SABOR', 'SALSA', 'COMPLEMENTO', 'PLATO', 'ACOMPAÑAMIENTO') THEN
        RAISE EXCEPTION 'El tipo del componente debe ser SABOR, SALSA, COMPLEMENTO, PLATO o ACOMPAÑAMIENTO';
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
-- CONFIGURAR TODOS LOS COMBOS EXISTENTES
-- =====================================================

-- 1. NAKAMA (C-NAKAMA) - 4 makis
SELECT combo_create_or_update_with_components(
  'C-NAKAMA',
  'Nakama',
  47.9,
  '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
  'Combo de 4 makis con salsas y palitos',
  'nakama.jpg',
  true,
  true,
  20,
  4,
  '[
    {"name": "Acevichado", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Anticuchero", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "California", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Cancha", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Chicha", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Conchitas a la parmesana", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Criollo", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Furai", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Futari", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Kaji", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Karamaru", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Katozema", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Kuma", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Lomito", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Loncco", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Magma", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Mishky", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Olivo", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Oranji", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Parrillero", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Shiro", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Supai", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Tataki", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Tiradito", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Ukuku", "type": "SABOR", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Acevichada", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Loncca", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Miel de maracuyá", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Seju", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Supai", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Tare", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Palito de sushi", "type": "COMPLEMENTO", "maxSelections": 2, "isRequired": false, "isAvailable": true}
  ]'::jsonb,
  (SELECT id FROM "Combo" WHERE code = 'C-NAKAMA' LIMIT 1)
);

-- 2. PUENTE NIKKEI (C-PUENTE) - 6 makis
SELECT combo_create_or_update_with_components(
  'C-PUENTE',
  'Puente nikkei',
  129.9,
  '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
  'Combo de 6 makis con salsas y palitos',
  'puente.jpg',
  true,
  true,
  25,
  6,
  '[
    {"name": "Acevichado", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Anticuchero", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "California", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Cancha", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Chicha", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Conchitas a la parmesana", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Criollo", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Furai", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Futari", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Kaji", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Karamaru", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Katozema", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Kuma", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Lomito", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Loncco", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Magma", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Mishky", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Olivo", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Oranji", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Parrillero", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Shiro", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Supai", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Tataki", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Tiradito", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Ukuku", "type": "SABOR", "maxSelections": 6, "isRequired": true, "isAvailable": true},
    {"name": "Acevichada", "type": "SALSA", "maxSelections": 5, "isRequired": true, "isAvailable": true},
    {"name": "Loncca", "type": "SALSA", "maxSelections": 5, "isRequired": true, "isAvailable": true},
    {"name": "Miel de maracuyá", "type": "SALSA", "maxSelections": 5, "isRequired": true, "isAvailable": true},
    {"name": "Seju", "type": "SALSA", "maxSelections": 5, "isRequired": true, "isAvailable": true},
    {"name": "Supai", "type": "SALSA", "maxSelections": 5, "isRequired": true, "isAvailable": true},
    {"name": "Tare", "type": "SALSA", "maxSelections": 5, "isRequired": true, "isAvailable": true},
    {"name": "Palito de sushi", "type": "COMPLEMENTO", "maxSelections": 5, "isRequired": false, "isAvailable": true}
  ]'::jsonb,
  (SELECT id FROM "Combo" WHERE code = 'C-PUENTE' LIMIT 1)
);

-- 3. BENTO 2 (C-BENTO2) - 1 plato + 1 maki
SELECT combo_create_or_update_with_components(
  'C-BENTO2',
  'Bento 2',
  32.9,
  '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
  'Combo bento con plato principal y maki',
  'bento2.jpg',
  true,
  true,
  15,
  2,
  '[
    {"name": "GODZILLA", "type": "PLATO", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Acevichado", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Anticuchero", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "California", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Cancha", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Chicha", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Conchitas a la parmesana", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Criollo", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Furai", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Futari", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Kaji", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Karamaru", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Katozema", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Kuma", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Lomito", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Loncco", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Magma", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Mishky", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Olivo", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Oranji", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Parrillero", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Shiro", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Supai", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Tataki", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Tiradito", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Ukuku", "type": "SABOR", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Acevichada", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Loncca", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Miel de maracuyá", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Seju", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Supai", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Tare", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Palito de sushi", "type": "COMPLEMENTO", "maxSelections": 1, "isRequired": false, "isAvailable": true}
  ]'::jsonb,
  (SELECT id FROM "Combo" WHERE code = 'C-BENTO2' LIMIT 1)
);

-- 4. BENTO 3 (C-BENTO3) - 2 makis + 1 acompañamiento
SELECT combo_create_or_update_with_components(
  'C-BENTO3',
  'Bento 3',
  29.9,
  '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
  'Combo bento con 2 makis y acompañamiento',
  'bento3.jpg',
  true,
  true,
  15,
  3,
  '[
    {"name": "Acevichado", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Anticuchero", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "California", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Cancha", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Chicha", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Conchitas a la parmesana", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Criollo", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Furai", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Futari", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Kaji", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Karamaru", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Katozema", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Kuma", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Lomito", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Loncco", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Magma", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Mishky", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Olivo", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Oranji", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Parrillero", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Shiro", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Supai", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Tataki", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Tiradito", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Ukuku", "type": "SABOR", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Gyozas (2 unidades)", "type": "ACOMPAÑAMIENTO", "maxSelections": 1, "isRequired": true, "isAvailable": true},
    {"name": "Acevichada", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Loncca", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Miel de maracuyá", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Seju", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Supai", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Tare", "type": "SALSA", "maxSelections": 2, "isRequired": true, "isAvailable": true},
    {"name": "Palito de sushi", "type": "COMPLEMENTO", "maxSelections": 1, "isRequired": false, "isAvailable": true}
  ]'::jsonb,
  (SELECT id FROM "Combo" WHERE code = 'C-BENTO3' LIMIT 1)
);

-- 5. COMBO DE PRUEBA FRONTEND (COMBO_TEST)
SELECT combo_create_or_update_with_components(
  'COMBO_TEST',
  'Combo de Prueba Frontend',
  29.9,
  '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
  'Combo de prueba para el frontend',
  'test.jpg',
  true,
  true,
  15,
  3,
  '[
    {"name": "Gyozas (8 unidades)", "type": "PLATO", "maxSelections": 3, "isRequired": true, "isAvailable": true},
    {"name": "Niguiris (2 unidades)", "type": "PLATO", "maxSelections": 3, "isRequired": true, "isAvailable": true},
    {"name": "Gunkans (3 unidades)", "type": "PLATO", "maxSelections": 3, "isRequired": true, "isAvailable": true}
  ]'::jsonb,
  (SELECT id FROM "Combo" WHERE code = 'COMBO_TEST' LIMIT 1)
);

-- 6. TEST_3020
SELECT combo_create_or_update_with_components(
  'TEST_3020',
  'Combo de Prueba Frontend',
  29.9,
  '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
  'Combo de prueba para el frontend',
  'test.jpg',
  true,
  true,
  15,
  3,
  '[
    {"name": "Gyozas (8 unidades)", "type": "PLATO", "maxSelections": 3, "isRequired": true, "isAvailable": true},
    {"name": "Niguiris (2 unidades)", "type": "PLATO", "maxSelections": 3, "isRequired": true, "isAvailable": true},
    {"name": "Gunkans (3 unidades)", "type": "PLATO", "maxSelections": 3, "isRequired": true, "isAvailable": true}
  ]'::jsonb,
  (SELECT id FROM "Combo" WHERE code = 'TEST_3020' LIMIT 1)
);

-- 7. DFASDFASDF (FDSFSDFSAD)
SELECT combo_create_or_update_with_components(
  'FDSFSDFSAD',
  'DFASDFASDF',
  200,
  '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
  'Combo personalizado',
  'custom.jpg',
  true,
  true,
  20,
  4,
  '[
    {"name": "Supai", "type": "PLATO", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Shiro", "type": "PLATO", "maxSelections": 4, "isRequired": true, "isAvailable": true},
    {"name": "Palito de sushi adicional", "type": "ACOMPAÑAMIENTO", "maxSelections": 2, "isRequired": false, "isAvailable": true},
    {"name": "Miel de maracuyá", "type": "ACOMPAÑAMIENTO", "maxSelections": 2, "isRequired": false, "isAvailable": true}
  ]'::jsonb,
  (SELECT id FROM "Combo" WHERE code = 'FDSFSDFSAD' LIMIT 1)
);

-- 8. BENTO 1 (C-BENTO1)
SELECT combo_create_or_update_with_components(
  'C-BENTO1',
  'Bento 1',
  29.9,
  '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
  'Combo bento básico',
  'bento1.jpg',
  true,
  true,
  15,
  3,
  '[
    {"name": "Criollo", "type": "PLATO", "maxSelections": 3, "isRequired": true, "isAvailable": true},
    {"name": "Eby furai (8 unidades)", "type": "PLATO", "maxSelections": 3, "isRequired": true, "isAvailable": true}
  ]'::jsonb,
  (SELECT id FROM "Combo" WHERE code = 'C-BENTO1' LIMIT 1)
);

-- 9. TEST COMBO (TEST_COMBO_001) - Sin componentes
SELECT combo_create_or_update_with_components(
  'TEST_COMBO_001',
  'Test Combo',
  25.99,
  'e4d355fc-fd94-4094-8651-7f5f396cf274',
  'Combo de prueba',
  'test.jpg',
  true,
  true,
  15,
  1,
  NULL,
  (SELECT id FROM "Combo" WHERE code = 'TEST_COMBO_001' LIMIT 1)
);

-- 10. PROMOCIÓN 30 ROLLS (C-PROMO30_UPDATED) - Sin componentes
SELECT combo_create_or_update_with_components(
  'C-PROMO30_UPDATED',
  'Promoción 30 rolls de maki (Updated)',
  30.99,
  'e4d355fc-fd94-4094-8651-7f5f396cf274',
  'Promoción especial de 30 rolls',
  'promo30.jpg',
  true,
  true,
  30,
  1,
  NULL,
  (SELECT id FROM "Combo" WHERE code = 'C-PROMO30_UPDATED' LIMIT 1)
);

-- 11. BARCO NIKKEI (C-BARCO_TEST) - Sin componentes
SELECT combo_create_or_update_with_components(
  'C-BARCO_TEST',
  'Barco nikkei (Test Update)',
  35.99,
  '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
  'Barco nikkei de prueba',
  'barco.jpg',
  true,
  true,
  25,
  1,
  NULL,
  (SELECT id FROM "Combo" WHERE code = 'C-BARCO_TEST' LIMIT 1)
);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Verificar que todos los combos se configuraron correctamente
SELECT 
  c.code,
  c.name,
  c."basePrice",
  COUNT(cc.id) as component_count
FROM "Combo" c
LEFT JOIN "ComboComponent" cc ON c.id = cc."comboId"
GROUP BY c.id, c.code, c.name, c."basePrice"
ORDER BY c.code;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================
-- 
-- Este SQL configura todos los combos existentes con sus componentes:
-- 
-- 1. NAKAMA: 4 makis + salsas + palitos
-- 2. PUENTE NIKKEI: 6 makis + salsas + palitos  
-- 3. BENTO 2: 1 plato + 1 maki + salsas + palitos
-- 4. BENTO 3: 2 makis + 1 acompañamiento + salsas + palitos
-- 5. COMBO_TEST: 3 platos diferentes
-- 6. TEST_3020: 3 platos diferentes
-- 7. DFASDFASDF: 2 platos + 2 acompañamientos
-- 8. BENTO 1: 2 platos
-- 9. TEST_COMBO_001: Sin componentes
-- 10. C-PROMO30_UPDATED: Sin componentes
-- 11. C-BARCO_TEST: Sin componentes
--
-- Todos los combos están configurados con los tipos de componentes correctos:
-- - SABOR: Para makis (con diferentes maxSelections)
-- - SALSA: Para salsas (con diferentes maxSelections)
-- - COMPLEMENTO: Para palitos y extras
-- - PLATO: Para platos principales
-- - ACOMPAÑAMIENTO: Para acompañamientos
--
-- =====================================================





