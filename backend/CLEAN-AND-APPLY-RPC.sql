-- =========================================================
-- SCRIPT PARA LIMPIAR Y APLICAR RPC DEFINITIVO
-- =========================================================
-- Este script elimina TODAS las versiones de create_order_with_items
-- y luego aplica la versión corregida
-- =========================================================

BEGIN;

-- PASO 1: Eliminar TODAS las versiones de la función (con todas las firmas posibles)
-- Esto resuelve el error "function name is not unique"

-- Eliminar función con firma original
DROP FUNCTION IF EXISTS public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
) CASCADE;

-- Eliminar función con firma alternativa (si existe)
DROP FUNCTION IF EXISTS public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC
) CASCADE;

-- Eliminar función con firma sin parámetros opcionales
DROP FUNCTION IF EXISTS public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC
) CASCADE;

-- Eliminar función con firma extendida
DROP FUNCTION IF EXISTS public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC, BOOLEAN, NUMERIC
) CASCADE;

-- Eliminar cualquier otra versión que pueda existir
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'create_order_with_items' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || func_record.proname || '(' || func_record.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- PASO 2: Crear la función corregida
CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_created_by      UUID,
  p_customer_name   TEXT,
  p_customer_phone  TEXT,
  p_discount        NUMERIC(10,2),
  p_items           JSONB,
  p_notes           TEXT,
  p_space_id        UUID,
  p_subtotal        NUMERIC(10,2),
  p_tax             NUMERIC(10,2),
  p_total_amount    NUMERIC(10,2)
)
RETURNS TABLE (id UUID, ordernumber TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id        UUID;
  v_order_number    TEXT;
  v_item            JSONB;
  v_qty             INTEGER;
  v_product_id      UUID;
  v_combo_id        UUID;
  v_unit_price      NUMERIC(10,2);
  v_name            TEXT;
  v_item_notes      TEXT;
  v_subtotal_calc   NUMERIC(10,2) := 0;
  v_subtotal_final  NUMERIC(10,2);
  v_tax_final       NUMERIC(10,2);
  v_discount_final  NUMERIC(10,2);
  v_total_final     NUMERIC(10,2);
BEGIN
  -- Validación básica
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'p_items debe ser un arreglo JSONB';
  END IF;

  -- Calcular subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
    v_item_notes := v_item->>'notes';
    
    -- Obtener precio del item
    v_unit_price := COALESCE((v_item->>'unitPrice')::numeric, 0);
    
    -- Si no hay precio, intentar obtenerlo de la BD
    IF v_unit_price = 0 THEN
      IF (v_item ? 'productId') AND (v_item->>'productId') IS NOT NULL THEN
        v_product_id := (v_item->>'productId')::uuid;
        SELECT COALESCE(p.price, 0) INTO v_unit_price FROM "Product" p WHERE p.id = v_product_id;
      ELSIF (v_item ? 'comboId') AND (v_item->>'comboId') IS NOT NULL THEN
        v_combo_id := (v_item->>'comboId')::uuid;
        SELECT COALESCE(c."basePrice", 0) INTO v_unit_price FROM "Combo" c WHERE c.id = v_combo_id;
      END IF;
    END IF;
    
    v_subtotal_calc := v_subtotal_calc + (v_unit_price * v_qty);
  END LOOP;

  -- Totales
  v_discount_final := COALESCE(p_discount, 0);
  v_tax_final := COALESCE(p_tax, 0);
  v_subtotal_final := COALESCE(p_subtotal, v_subtotal_calc);
  v_total_final := COALESCE(p_total_amount, v_subtotal_final + v_tax_final - v_discount_final);

  -- Insertar orden
  INSERT INTO "Order" (
    "spaceId", "customerName", "customerPhone",
    status, "totalAmount", subtotal, tax, discount,
    notes, "createdBy", "createdAt", "updatedAt"
  ) VALUES (
    p_space_id, p_customer_name, p_customer_phone,
    'PENDIENTE', v_total_final, v_subtotal_final, v_tax_final, v_discount_final,
    p_notes, p_created_by, NOW(), NOW()
  );

  -- Obtener ID de la orden recién creada
  SELECT o.id INTO v_order_id FROM "Order" AS o 
  WHERE o."spaceId" = p_space_id 
  AND o."createdBy" = p_created_by 
  ORDER BY o."createdAt" DESC LIMIT 1;

  -- Obtener orderNumber
  SELECT o."orderNumber" INTO v_order_number FROM "Order" AS o WHERE o.id = v_order_id;

  IF v_order_number IS NULL OR v_order_number = '' THEN
    UPDATE "Order" AS o
       SET "orderNumber" = 'ORD' || TO_CHAR(NOW(), 'YYMMDDHH24MISS') || LPAD(FLOOR(RANDOM()*100)::TEXT, 2, '0')
     WHERE o.id = v_order_id;
    SELECT o."orderNumber" INTO v_order_number FROM "Order" AS o WHERE o.id = v_order_id;
  END IF;

  -- Insertar items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
    v_item_notes := v_item->>'notes';
    v_name := COALESCE(v_item->>'name', 'Item sin nombre');
    
    -- Obtener precio
    v_unit_price := COALESCE((v_item->>'unitPrice')::numeric, 0);
    
    -- Si no hay precio, intentar obtenerlo de la BD
    IF v_unit_price = 0 THEN
      IF (v_item ? 'productId') AND (v_item->>'productId') IS NOT NULL THEN
        v_product_id := (v_item->>'productId')::uuid;
        SELECT COALESCE(p.price, 0) INTO v_unit_price FROM "Product" p WHERE p.id = v_product_id;
      ELSIF (v_item ? 'comboId') AND (v_item->>'comboId') IS NOT NULL THEN
        v_combo_id := (v_item->>'comboId')::uuid;
        SELECT COALESCE(c."basePrice", 0) INTO v_unit_price FROM "Combo" c WHERE c.id = v_combo_id;
      END IF;
    END IF;

    -- Insertar item
    INSERT INTO "OrderItem"(
      "orderId", "productId", "comboId", name,
      quantity, "unitPrice", "totalPrice", notes, status, "createdAt"
    ) VALUES (
      v_order_id, 
      CASE WHEN (v_item ? 'productId') AND (v_item->>'productId') IS NOT NULL THEN (v_item->>'productId')::uuid ELSE NULL END,
      CASE WHEN (v_item ? 'comboId') AND (v_item->>'comboId') IS NOT NULL THEN (v_item->>'comboId')::uuid ELSE NULL END,
      v_name,
      v_qty, v_unit_price, (v_unit_price * v_qty), v_item_notes, 'PENDIENTE', NOW()
    );
  END LOOP;

  -- Recalcular totales
  WITH s AS (
    SELECT COALESCE(SUM(oi."totalPrice"),0)::numeric(10,2) AS sum_items
    FROM "OrderItem" oi
    WHERE oi."orderId" = v_order_id
  )
  UPDATE "Order" o
     SET subtotal = s.sum_items,
         "totalAmount" = (s.sum_items + v_tax_final - v_discount_final),
         "updatedAt" = NOW()
    FROM s
   WHERE o.id = v_order_id;

  -- Ocupar espacio
  UPDATE "Space" s
     SET status = 'OCUPADA', "updatedAt" = NOW()
   WHERE s.id = p_space_id;

  -- Historial
  INSERT INTO "OrderStatusHistory"("orderId","status","changedBy","notes","createdAt")
  VALUES (v_order_id, 'PENDIENTE', p_created_by, 'Creación de pedido', NOW());

  -- Retornar resultado
  id := v_order_id;
  ordernumber := v_order_number;
  RETURN NEXT;
END;
$$;

-- PASO 3: Otorgar permisos
GRANT EXECUTE ON FUNCTION public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
) TO anon, authenticated;

-- PASO 4: Verificar que la función se creó correctamente
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'create_order_with_items' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        RAISE NOTICE '✅ Función create_order_with_items creada exitosamente';
    ELSE
        RAISE EXCEPTION '❌ Error: La función no se pudo crear';
    END IF;
END $$;

COMMIT;

-- =========================================================
-- INSTRUCCIONES DE USO:
-- 1. Ejecuta este script completo en tu base de datos Supabase
-- 2. El script eliminará TODAS las versiones anteriores
-- 3. Creará la versión corregida que soluciona los problemas
-- 4. Verificará que se creó correctamente
-- =========================================================





