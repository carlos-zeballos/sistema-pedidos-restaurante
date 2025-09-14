-- =====================================================
-- MEJORAS EN LA CREACIÓN DE ÓRDENES
-- =====================================================
-- Este script mejora la función de creación de órdenes para evitar duplicados
-- y asegurar que el ciclo de órdenes funcione correctamente

BEGIN;

-- 1. Crear función mejorada para verificar si un espacio está disponible
CREATE OR REPLACE FUNCTION public.is_space_available(p_space_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_space_status TEXT;
  v_active_orders_count INTEGER;
BEGIN
  -- Verificar el estado del espacio
  SELECT status INTO v_space_status
  FROM "Space"
  WHERE id = p_space_id AND "isActive" = TRUE;
  
  IF v_space_status IS NULL THEN
    RETURN FALSE; -- Espacio no existe o no está activo
  END IF;
  
  IF v_space_status = 'LIBRE' THEN
    RETURN TRUE; -- Espacio libre
  END IF;
  
  -- Si está OCUPADA, verificar si hay órdenes activas del día actual
  SELECT COUNT(*) INTO v_active_orders_count
  FROM "Order"
  WHERE "spaceId" = p_space_id
    AND status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO')
    AND DATE("createdAt") = CURRENT_DATE;
  
  -- Si no hay órdenes activas del día actual, el espacio debería estar libre
  IF v_active_orders_count = 0 THEN
    -- Liberar el espacio automáticamente
    UPDATE "Space"
    SET status = 'LIBRE', "updatedAt" = NOW()
    WHERE id = p_space_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE; -- Espacio ocupado con órdenes activas
END;
$$;

-- 2. Mejorar la función de creación de órdenes
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
SET search_path = public, pg_temp
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
  -- 1) Validaciones mejoradas
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'p_items debe ser un arreglo JSONB con al menos un item';
  END IF;

  -- Verificar que el espacio esté disponible
  IF NOT public.is_space_available(p_space_id) THEN
    RAISE EXCEPTION 'El espacio no está disponible para nuevas órdenes';
  END IF;

  -- 2) Calcular subtotal a partir de los ítems
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULL;
    v_combo_id   := NULL;
    v_qty        := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
    v_item_notes := v_item->>'notes';

    IF (v_item ? 'productId') THEN
      v_product_id := (v_item->>'productId')::uuid;
    ELSIF (v_item ? 'comboId') THEN
      v_combo_id := (v_item->>'comboId')::uuid;
    ELSE
      RAISE EXCEPTION 'Cada item debe tener productId o comboId. Item: %', v_item;
    END IF;

    -- Precio unitario (param o catálogo)
    IF (v_item ? 'unitPrice') THEN
      v_unit_price := (v_item->>'unitPrice')::numeric;
    ELSE
      IF v_product_id IS NOT NULL THEN
        SELECT p.price::numeric INTO v_unit_price FROM "Product" p WHERE p.id = v_product_id;
      ELSE
        SELECT c."basePrice"::numeric INTO v_unit_price FROM "Combo" c WHERE c.id = v_combo_id;
      END IF;
    END IF;

    v_name := NULLIF(v_item->>'name','');
    IF v_name IS NULL THEN
      IF v_product_id IS NOT NULL THEN
        SELECT p.name INTO v_name FROM "Product" p WHERE p.id = v_product_id;
      ELSE
        SELECT c.name INTO v_name FROM "Combo" c WHERE c.id = v_combo_id;
      END IF;
    END IF;

    v_subtotal_calc := v_subtotal_calc + (v_unit_price * v_qty);
  END LOOP;

  -- 3) Calcular totales finales
  v_discount_final := COALESCE(p_discount, 0);
  v_tax_final      := COALESCE(p_tax, 0);
  v_subtotal_final := COALESCE(p_subtotal, v_subtotal_calc);
  v_total_final    := COALESCE(p_total_amount, v_subtotal_final + v_tax_final - v_discount_final);
  
  -- 4) Insertar cabecera de orden
  INSERT INTO "Order" (
    "spaceId", "customerName", "customerPhone",
    status, "totalAmount", subtotal, tax, discount,
    notes, "createdBy", "createdAt", "updatedAt"
  ) VALUES (
    p_space_id, p_customer_name, p_customer_phone,
    'PENDIENTE', v_total_final, v_subtotal_final, v_tax_final, v_discount_final,
    p_notes, p_created_by, NOW(), NOW()
  ) RETURNING id, "orderNumber" INTO v_order_id, v_order_number;
  
  -- 5) Insertar ítems
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULL;
    v_combo_id   := NULL;
    v_qty        := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
    v_item_notes := v_item->>'notes';

    IF (v_item ? 'productId') THEN
      v_product_id := (v_item->>'productId')::uuid;
    ELSIF (v_item ? 'comboId') THEN
      v_combo_id := (v_item->>'comboId')::uuid;
    END IF;

    IF (v_item ? 'unitPrice') THEN
      v_unit_price := (v_item->>'unitPrice')::numeric;
    ELSE
      IF v_product_id IS NOT NULL THEN
        SELECT p.price::numeric INTO v_unit_price FROM "Product" p WHERE p.id = v_product_id;
      ELSE
        SELECT c."basePrice"::numeric INTO v_unit_price FROM "Combo" c WHERE c.id = v_combo_id;
      END IF;
    END IF;

    v_name := NULLIF(v_item->>'name','');
    IF v_name IS NULL THEN
      IF v_product_id IS NOT NULL THEN
        SELECT p.name INTO v_name FROM "Product" p WHERE p.id = v_product_id;
      ELSE
        SELECT c.name INTO v_name FROM "Combo" c WHERE c.id = v_combo_id;
      END IF;
    END IF;

    INSERT INTO "OrderItem"(
      "orderId", "productId", "comboId", name,
      quantity, "unitPrice", "totalPrice", notes, status, "createdAt"
    ) VALUES (
      v_order_id, v_product_id, v_combo_id, v_name,
      v_qty, v_unit_price, (v_unit_price * v_qty), v_item_notes, 'PENDIENTE', NOW()
    );
  END LOOP;

  -- 6) Recalcular totales cabecera
  WITH s AS (
    SELECT COALESCE(SUM(oi."totalPrice"),0)::numeric(10,2) AS sum_items
    FROM "OrderItem" AS oi
    WHERE oi."orderId" = v_order_id
  )
  UPDATE "Order" AS o
     SET subtotal      = s.sum_items,
         "totalAmount" = (s.sum_items + v_tax_final - v_discount_final),
         "updatedAt"   = NOW()
    FROM s
   WHERE o.id = v_order_id;
  
  -- 7) Marcar espacio como OCUPADA
  UPDATE "Space" AS s
     SET status = 'OCUPADA',
         "updatedAt" = NOW()
   WHERE s.id = p_space_id;
  
  -- 8) Historial inicial
  INSERT INTO "OrderStatusHistory" AS osh("orderId","status","changedBy","notes","createdAt")
  VALUES (v_order_id, 'PENDIENTE', p_created_by, 'Creación de pedido', NOW());
  
  -- 9) Salida
  id := v_order_id;
  ordernumber := v_order_number;
  RETURN NEXT;
  RETURN;
END;
$$;

-- 3. Crear función para limpiar órdenes automáticamente al final del día
CREATE OR REPLACE FUNCTION public.cleanup_daily_orders()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Marcar como CANCELADO todas las órdenes de días anteriores que no están PAGADAS
  UPDATE "Order" 
  SET 
    status = 'CANCELADO',
    "updatedAt" = NOW()
  WHERE 
    status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO')
    AND DATE("createdAt") < CURRENT_DATE;

  -- Liberar espacios de órdenes canceladas
  UPDATE "Space" 
  SET 
    status = 'LIBRE',
    "updatedAt" = NOW()
  WHERE 
    id IN (
      SELECT DISTINCT "spaceId" 
      FROM "Order" 
      WHERE status = 'CANCELADO' 
      AND DATE("createdAt") < CURRENT_DATE
    );

  -- Crear entradas en el historial
  INSERT INTO "OrderStatusHistory" ("orderId", "status", "changedBy", "notes", "createdAt")
  SELECT 
    o.id,
    'CANCELADO',
    o."createdBy",
    'Cancelado automáticamente - orden de día anterior',
    NOW()
  FROM "Order" o
  WHERE 
    o.status = 'CANCELADO'
    AND DATE(o."createdAt") < CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM "OrderStatusHistory" osh 
      WHERE osh."orderId" = o.id 
      AND osh."status" = 'CANCELADO'
    );
END;
$$;

-- 4. Permisos
REVOKE ALL ON FUNCTION public.is_space_available(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_space_available(UUID) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.cleanup_daily_orders() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_daily_orders() TO anon, authenticated;

-- 5. Refrescar esquema API
SELECT pg_notify('pgrst','reload schema');

COMMIT;

SELECT 'Mejoras en la creación de órdenes aplicadas exitosamente' as resultado;











