-- RPC con logs de debugging para investigar precios
CREATE OR REPLACE FUNCTION create_order_with_items_debug(
  p_space_id uuid,
  p_created_by uuid,
  p_customer_name text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL,
  p_total_amount numeric DEFAULT 0,
  p_subtotal numeric DEFAULT 0,
  p_tax numeric DEFAULT 0,
  p_discount numeric DEFAULT 0,
  p_notes text DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_delivery_cost numeric DEFAULT 0,
  p_is_delivery boolean DEFAULT false
)
RETURNS TABLE(id uuid, ordernumber text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_product_id uuid;
  v_combo_id uuid;
  v_qty integer;
  v_item_notes text;
  v_unit_price numeric;
  v_name text;
  v_subtotal_calc numeric := 0;
  v_discount_final numeric;
  v_tax_final numeric;
  v_subtotal_final numeric;
  v_total_final numeric;
BEGIN
  -- 1) Generar número de orden
  v_order_number := 'ORD' || TO_CHAR(NOW(), 'YYMMDDHH24MISS') || LPAD(FLOOR(RANDOM()*100)::TEXT, 2, '0');
  
  -- 2) Insertar cabecera
  INSERT INTO "Order" (
    "spaceId", "customerName", "customerPhone",
    status, "totalAmount", subtotal, tax, discount,
    notes, "createdBy", "createdAt", "updatedAt"
  ) VALUES (
    p_space_id, p_customer_name, p_customer_phone,
    'PENDIENTE', p_total_amount, p_subtotal, p_tax, p_discount,
    p_notes, p_created_by, NOW(), NOW()
  )
  RETURNING "Order".id, "Order"."orderNumber" INTO v_order_id, v_order_number;

  -- 3) Procesar items con logs detallados
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULL;
    v_combo_id := NULL;
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
    v_item_notes := v_item->>'notes';

    -- Log del item recibido
    RAISE NOTICE '🔍 Procesando item: %', v_item;

    IF (v_item ? 'productId') THEN
      v_product_id := (v_item->>'productId')::uuid;
      RAISE NOTICE '   - Product ID: %', v_product_id;
    ELSIF (v_item ? 'comboId') THEN
      v_combo_id := (v_item->>'comboId')::uuid;
      RAISE NOTICE '   - Combo ID: %', v_combo_id;
    END IF;

    -- Calcular precio unitario con logs
    IF (v_item ? 'unitPrice') THEN
      v_unit_price := (v_item->>'unitPrice')::numeric;
      RAISE NOTICE '   - Usando unitPrice del frontend: %', v_unit_price;
    ELSE
      RAISE NOTICE '   - unitPrice no encontrado, buscando en BD...';
      IF v_product_id IS NOT NULL THEN
        SELECT p.price::numeric INTO v_unit_price FROM "Product" p WHERE p.id = v_product_id;
        RAISE NOTICE '   - Precio de producto desde BD: %', v_unit_price;
      ELSE
        SELECT c."basePrice"::numeric INTO v_unit_price FROM "Combo" c WHERE c.id = v_combo_id;
        RAISE NOTICE '   - Precio de combo desde BD: %', v_unit_price;
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

    -- Log final antes de insertar
    RAISE NOTICE '   - Nombre: %', v_name;
    RAISE NOTICE '   - Cantidad: %', v_qty;
    RAISE NOTICE '   - Precio unitario: %', v_unit_price;
    RAISE NOTICE '   - Precio total: %', (v_unit_price * v_qty);

    INSERT INTO "OrderItem"(
      "orderId","productId","comboId",name,
      quantity,"unitPrice","totalPrice",notes,status,"createdAt"
    ) VALUES (
      v_order_id, v_product_id, v_combo_id, v_name,
      v_qty, v_unit_price, (v_unit_price * v_qty), v_item_notes, 'PENDIENTE', NOW()
    );

    v_subtotal_calc := v_subtotal_calc + (v_unit_price * v_qty);
  END LOOP;

  -- 4) Recalcular totales
  WITH s AS (
    SELECT COALESCE(SUM(oi."totalPrice"),0)::numeric(10,2) AS sum_items
    FROM "OrderItem" oi
    WHERE oi."orderId" = v_order_id
  )
  UPDATE "Order" o
     SET subtotal = s.sum_items,
         "totalAmount" = (s.sum_items + p_tax - p_discount),
         "updatedAt" = NOW()
    FROM s
   WHERE o.id = v_order_id;

  -- 5) Marcar espacio como OCUPADA
  UPDATE "Space" s
     SET status = 'OCUPADA', "updatedAt" = NOW()
   WHERE s.id = p_space_id;

  -- 6) Retornar resultado
  id := v_order_id;
  ordernumber := v_order_number;
  RETURN NEXT;
END;
$$;





