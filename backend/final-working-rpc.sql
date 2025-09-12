BEGIN;

-- =========================================================
-- RPC FINAL Y FUNCIONAL
-- =========================================================
-- Corrige el error: record "new" has no field "ordernumber"
-- =========================================================

DROP FUNCTION IF EXISTS public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
);

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
  -- 1) Validaciones
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'p_items debe ser un arreglo JSONB con al menos un item';
  END IF;

  -- Espacio activo
  PERFORM 1 FROM "Space" s WHERE s.id = p_space_id AND s."isActive" IS TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El espacio % no existe o no está activo', p_space_id;
  END IF;

  -- Usuario activo (¡en minúsculas!)
  PERFORM 1 FROM "User" u WHERE u.id = p_created_by AND u.isactive IS TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El usuario creador % no existe o no está activo', p_created_by;
  END IF;

  -- 2) Calcular subtotal desde items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULL;
    v_combo_id   := NULL;
    v_qty        := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
    v_item_notes := v_item->>'notes';

    IF (v_item ? 'productId') THEN
      v_product_id := (v_item->>'productId')::uuid;
      PERFORM 1 FROM "Product" p
       WHERE p.id = v_product_id AND p."isEnabled" IS TRUE AND p."isAvailable" IS TRUE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no existe, no está habilitado o no está disponible', v_product_id;
      END IF;
    ELSIF (v_item ? 'comboId') THEN
      v_combo_id := (v_item->>'comboId')::uuid;
      PERFORM 1 FROM "Combo" c
       WHERE c.id = v_combo_id AND c."isEnabled" IS TRUE AND c."isAvailable" IS TRUE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Combo % no existe, no está habilitado o no está disponible', v_combo_id;
      END IF;
    ELSE
      RAISE EXCEPTION 'Cada item debe tener productId o comboId. Item: %', v_item;
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

    IF v_unit_price IS NULL THEN
      RAISE EXCEPTION 'No se pudo determinar el precio unitario del item: %', v_item;
    END IF;

    v_subtotal_calc := v_subtotal_calc + (v_unit_price * v_qty);
  END LOOP;

  -- 3) Totales finales
  v_discount_final := COALESCE(p_discount, 0);
  v_tax_final      := COALESCE(p_tax, 0);
  v_subtotal_final := COALESCE(p_subtotal, v_subtotal_calc);
  v_total_final    := COALESCE(p_total_amount, v_subtotal_final + v_tax_final - v_discount_final);

  -- 4) Insert cabecera SIN RETURNING para evitar problemas de casing
  INSERT INTO "Order" (
    "spaceId","customerName","customerPhone",
    status,"totalAmount",subtotal,tax,discount,
    notes,"createdBy","createdAt","updatedAt"
  ) VALUES (
    p_space_id, p_customer_name, p_customer_phone,
    'PENDIENTE', v_total_final, v_subtotal_final, v_tax_final, v_discount_final,
    p_notes, p_created_by, NOW(), NOW()
  );

  -- Obtener el ID insertado usando currval
  v_order_id := currval(pg_get_serial_sequence('"Order"', 'id'));
  
  -- Si no hay secuencia, buscar el último registro insertado
  IF v_order_id IS NULL THEN
    SELECT o.id INTO v_order_id FROM "Order" AS o 
    WHERE o."spaceId" = p_space_id 
    AND o."createdBy" = p_created_by 
    AND o."customerName" = p_customer_name
    ORDER BY o."createdAt" DESC LIMIT 1;
  END IF;

  -- Obtener el orderNumber con el casing correcto
  SELECT o."orderNumber" INTO v_order_number FROM "Order" AS o WHERE o.id = v_order_id;

  -- Si el trigger no generó número, forzar uno
  IF v_order_number IS NULL OR v_order_number = '' THEN
    UPDATE "Order" AS o
       SET "orderNumber" = 'ORD' || TO_CHAR(NOW(), 'YYMMDDHH24MISS') || LPAD(FLOOR(RANDOM()*100)::TEXT, 2, '0')
     WHERE o.id = v_order_id;

    -- Obtener el número generado
    SELECT o."orderNumber" INTO v_order_number FROM "Order" AS o WHERE o.id = v_order_id;
  END IF;

  -- 5) Insertar items
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
      "orderId","productId","comboId",name,
      quantity,"unitPrice","totalPrice",notes,status,"createdAt"
    ) VALUES (
      v_order_id, v_product_id, v_combo_id, v_name,
      v_qty, v_unit_price, (v_unit_price * v_qty), v_item_notes, 'PENDIENTE', NOW()
    );
  END LOOP;

  -- 6) Recalcular totales
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

  -- 7) Ocupar espacio
  UPDATE "Space" s
     SET status = 'OCUPADA', "updatedAt" = NOW()
   WHERE s.id = p_space_id;

  -- 8) Historial inicial
  INSERT INTO "OrderStatusHistory"("orderId","status","changedBy","notes","createdAt")
  VALUES (v_order_id, 'PENDIENTE', p_created_by, 'Creación de pedido', NOW());

  -- 9) Salida
  id := v_order_id;
  ordernumber := v_order_number;
  RETURN NEXT;
END;
$$;

-- Permisos
REVOKE ALL ON FUNCTION public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
) TO anon, authenticated;

-- Refrescar esquema API
SELECT pg_notify('pgrst','reload schema');

COMMIT;











