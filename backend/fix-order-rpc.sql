-- Corregir la función RPC para resolver la ambigüedad de la variable "id"
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
  v_order_id        UUID;  -- Variable local para el ID de la orden
  v_order_number    TEXT;  -- Variable local para el número de orden
BEGIN
  -- 1) Validaciones básicas
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'p_items debe ser un arreglo JSONB con al menos un item';
  END IF;

  -- 2) Primer pase: calcular subtotal a partir de los items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULL;
    v_combo_id   := NULL;
    v_qty        := GREATEST(1, COALESCE( (v_item->>'quantity')::int, 1 ));
    v_item_notes := v_item->>'notes';

    IF (v_item ? 'productId') THEN
      v_product_id := (v_item->>'productId')::uuid;
    ELSIF (v_item ? 'comboId') THEN
      v_combo_id := (v_item->>'comboId')::uuid;
    ELSE
      RAISE EXCEPTION 'Cada item debe tener productId o comboId. Item: %', v_item;
    END IF;

    -- Precio unitario: usa unitPrice del JSON si viene, si no, trae de Product/Combo
    v_unit_price := NULL;
    IF (v_item ? 'unitPrice') THEN
      v_unit_price := (v_item->>'unitPrice')::numeric;
    ELSE
      IF v_product_id IS NOT NULL THEN
        SELECT price::numeric INTO v_unit_price FROM "Product" WHERE id = v_product_id;
      ELSE
        SELECT "basePrice"::numeric INTO v_unit_price FROM "Combo" WHERE id = v_combo_id;
      END IF;
    END IF;

    IF v_unit_price IS NULL THEN
      RAISE EXCEPTION 'No se pudo determinar el precio unitario del item: %', v_item;
    END IF;

    v_subtotal_calc := v_subtotal_calc + (v_unit_price * v_qty);
  END LOOP;

  -- 3) Totales finales (usa lo provisto o calcula)
  v_discount_final := COALESCE(p_discount, 0);
  v_tax_final      := COALESCE(p_tax, 0);
  v_subtotal_final := COALESCE(p_subtotal, v_subtotal_calc);
  v_total_final    := COALESCE(p_total_amount, v_subtotal_final + v_tax_final - v_discount_final);

  -- 4) Insertar cabecera
  INSERT INTO "Order" (
    "spaceId", "customerName", "customerPhone",
    status, "totalAmount", subtotal, tax, discount,
    notes, "createdBy", "createdAt", "updatedAt"
  ) VALUES (
    p_space_id, p_customer_name, p_customer_phone,
    'PENDIENTE', v_total_final, v_subtotal_final, v_tax_final, v_discount_final,
    p_notes, p_created_by, NOW(), NOW()
  )
  RETURNING "Order".id, "Order"."orderNumber" INTO v_order_id, v_order_number;

  -- 5) Asegurar número de orden por si el trigger no lo puso
  IF v_order_number IS NULL OR v_order_number = '' THEN
    UPDATE "Order"
       SET "orderNumber" = 'ORD' || TO_CHAR(NOW(), 'YYMMDDHH24MISS') || LPAD(FLOOR(RANDOM()*100)::TEXT, 2, '0')
     WHERE "Order".id = v_order_id
    RETURNING "Order"."orderNumber" INTO v_order_number;
  END IF;

  -- 6) Segundo pase: insertar ítems
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULL;
    v_combo_id   := NULL;
    v_qty        := GREATEST(1, COALESCE( (v_item->>'quantity')::int, 1 ));
    v_item_notes := v_item->>'notes';

    IF (v_item ? 'productId') THEN
      v_product_id := (v_item->>'productId')::uuid;
    ELSIF (v_item ? 'comboId') THEN
      v_combo_id := (v_item->>'comboId')::uuid;
    END IF;

    v_unit_price := NULL;
    IF (v_item ? 'unitPrice') THEN
      v_unit_price := (v_item->>'unitPrice')::numeric;
    ELSE
      IF v_product_id IS NOT NULL THEN
        SELECT price::numeric INTO v_unit_price FROM "Product" WHERE id = v_product_id;
      ELSE
        SELECT "basePrice"::numeric INTO v_unit_price FROM "Combo" WHERE id = v_combo_id;
      END IF;
    END IF;

    v_name := NULL;
    IF (v_item ? 'name') THEN
      v_name := NULLIF(v_item->>'name','');
    END IF;
    IF v_name IS NULL THEN
      IF v_product_id IS NOT NULL THEN
        SELECT name INTO v_name FROM "Product" WHERE id = v_product_id;
      ELSE
        SELECT name INTO v_name FROM "Combo" WHERE id = v_combo_id;
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

  -- 7) Recalcular por si hay desajuste y actualizar cabecera
  WITH s AS (
    SELECT COALESCE(SUM("totalPrice"),0)::numeric(10,2) AS sum_items
    FROM "OrderItem"
    WHERE "orderId" = v_order_id
  )
  UPDATE "Order" o
     SET subtotal    = s.sum_items,
         "totalAmount" = (s.sum_items + v_tax_final - v_discount_final),
         "updatedAt" = NOW()
    FROM s
   WHERE o.id = v_order_id;

  -- 8) Marcar el espacio como OCUPADA
  UPDATE "Space"
     SET status = 'OCUPADA',
         "updatedAt" = NOW()
   WHERE id = p_space_id;

  -- 9) Retornar resultados
  id := v_order_id;
  ordernumber := v_order_number;
  RETURN NEXT;
END;
$$;

-- Refrescar el esquema de la API
SELECT pg_notify('pgrst','reload schema');

-- Verificar que la función se creó correctamente
SELECT 'Function fixed successfully' as status;




