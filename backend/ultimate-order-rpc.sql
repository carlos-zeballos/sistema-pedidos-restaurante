BEGIN;

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
  -- variables locales para evitar ambigüedad
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

  -- 3) Totales
  v_discount_final := COALESCE(p_discount, 0);
  v_tax_final      := COALESCE(p_tax, 0);
  v_subtotal_final := COALESCE(p_subtotal, v_subtotal_calc);
  v_total_final    := COALESCE(p_total_amount, v_subtotal_final + v_tax_final - v_discount_final);

  -- 4) Insertar cabecera con referencias explícitas a columnas
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

  -- 5) Forzar orderNumber si el trigger no lo hizo
  IF v_order_number IS NULL OR v_order_number = '' THEN
    UPDATE "Order" AS o
       SET "orderNumber" = 'ORD' || TO_CHAR(NOW(), 'YYMMDDHH24MISS') || LPAD(FLOOR(RANDOM()*100)::TEXT, 2, '0')
     WHERE o.id = v_order_id
    RETURNING "orderNumber" INTO v_order_number;
  END IF;

  -- 6) Insertar ítems
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
        SELECT price::numeric INTO v_unit_price FROM "Product" WHERE id = v_product_id;
      ELSE
        SELECT "basePrice"::numeric INTO v_unit_price FROM "Combo" WHERE id = v_combo_id;
      END IF;
    END IF;

    v_name := NULLIF(v_item->>'name','');
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

  -- 7) Recalcular y actualizar cabecera
  WITH s AS (
    SELECT COALESCE(SUM("totalPrice"),0)::numeric(10,2) AS sum_items
    FROM "OrderItem"
    WHERE "orderId" = v_order_id
  )
  UPDATE "Order" o
     SET subtotal      = s.sum_items,
         "totalAmount" = (s.sum_items + v_tax_final - v_discount_final),
         "updatedAt"   = NOW()
    FROM s
   WHERE o.id = v_order_id;

  -- 8) Marcar espacio como OCUPADA
  UPDATE "Space" s
     SET status = 'OCUPADA',
         "updatedAt" = NOW()
   WHERE s.id = p_space_id;

  -- 9) Salida
  id := v_order_id;
  ordernumber := v_order_number;
  RETURN NEXT;
END;
$$;

-- refrescar esquema API
SELECT pg_notify('pgrst','reload schema');

COMMIT;








