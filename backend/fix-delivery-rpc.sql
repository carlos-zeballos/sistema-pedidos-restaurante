-- =========================================================
-- CORRECCIÓN CRÍTICA: RPC con parámetros de delivery
-- =========================================================
-- Esta función incluye los parámetros p_delivery_cost y p_is_delivery
-- que el backend está intentando pasar pero la función actual no acepta
-- =========================================================

BEGIN;

-- Eliminar la función anterior si existe
DROP FUNCTION IF EXISTS public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
);

-- Crear la función corregida con parámetros de delivery
CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_space_id        UUID,
  p_created_by      UUID,
  p_customer_name   TEXT DEFAULT NULL,
  p_customer_phone  TEXT DEFAULT NULL,
  p_total_amount    NUMERIC(10,2) DEFAULT 0,
  p_subtotal        NUMERIC(10,2) DEFAULT 0,
  p_tax             NUMERIC(10,2) DEFAULT 0,
  p_discount        NUMERIC(10,2) DEFAULT 0,
  p_notes           TEXT DEFAULT NULL,
  p_items           JSONB DEFAULT '[]'::jsonb,
  p_delivery_cost   NUMERIC(10,2) DEFAULT 0,
  p_is_delivery     BOOLEAN DEFAULT FALSE
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
  -- 1) Validaciones básicas
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'p_items debe ser un arreglo JSONB con al menos un item';
  END IF;

  -- 2) Calcular subtotal a partir de los items
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

    -- Precio unitario: usa unitPrice del JSON si viene, si no, trae de Product/Combo
    v_unit_price := COALESCE((v_item->>'unitPrice')::numeric, 0);
    v_name := COALESCE(v_item->>'name', 'Item sin nombre');

    -- Acumular subtotal
    v_subtotal_calc := v_subtotal_calc + (v_unit_price * v_qty);
  END LOOP;

  -- 3) Usar valores calculados o los pasados como parámetros
  v_subtotal_final := COALESCE(p_subtotal, v_subtotal_calc);
  v_tax_final := COALESCE(p_tax, 0);
  v_discount_final := COALESCE(p_discount, 0);
  v_total_final := COALESCE(p_total_amount, v_subtotal_final + v_tax_final - v_discount_final + p_delivery_cost);

  -- 4) Insertar la orden con los campos de delivery
  INSERT INTO "Order" (
    "spaceId",
    "createdBy",
    "customerName",
    "customerPhone",
    "status",
    "totalAmount",
    "subtotal",
    "tax",
    "discount",
    "notes",
    "deliveryCost",
    "isDelivery",
    "createdAt",
    "updatedAt"
  ) VALUES (
    p_space_id,
    p_created_by,
    p_customer_name,
    p_customer_phone,
    'PENDIENTE',
    v_total_final,
    v_subtotal_final,
    v_tax_final,
    v_discount_final,
    p_notes,
    p_delivery_cost,
    p_is_delivery,
    NOW(),
    NOW()
  ) RETURNING id, "orderNumber" INTO v_order_id, v_order_number;

  -- 5) Insertar los items de la orden
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

    v_unit_price := COALESCE((v_item->>'unitPrice')::numeric, 0);
    v_name := COALESCE(v_item->>'name', 'Item sin nombre');

    INSERT INTO "OrderItem" (
      "orderId",
      "productId",
      "comboId",
      "name",
      "unitPrice",
      "totalPrice",
      "quantity",
      "status",
      "notes",
      "createdAt",
      "updatedAt"
    ) VALUES (
      v_order_id,
      v_product_id,
      v_combo_id,
      v_name,
      v_unit_price,
      v_unit_price * v_qty,
      v_qty,
      'PENDIENTE',
      v_item_notes,
      NOW(),
      NOW()
    );
  END LOOP;

  -- 6) Retornar el resultado
  RETURN QUERY SELECT v_order_id, v_order_number;
END;
$$;

COMMIT;






