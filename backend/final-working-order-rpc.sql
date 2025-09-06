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
  -- cabecera
  v_order_id        UUID;
  v_order_number    TEXT;

  -- validaciones básicas
  v_dummy           int;

  -- item loop
  v_item            JSONB;
  v_qty             INTEGER;
  v_product_id      UUID;
  v_combo_id        UUID;
  v_unit_price      NUMERIC(10,2);
  v_name            TEXT;
  v_item_notes      TEXT;
  v_order_item_id   UUID;

  -- componentes loop
  v_comp            JSONB;
  v_comp_id         UUID;
  v_comp_name       TEXT;
  v_comp_type       TEXT;
  v_comp_price      NUMERIC(10,2);
  v_comp_qty        INTEGER;
  v_comp_notes      TEXT;

  -- totales
  v_subtotal_calc   NUMERIC(10,2) := 0;
  v_subtotal_final  NUMERIC(10,2);
  v_tax_final       NUMERIC(10,2);
  v_discount_final  NUMERIC(10,2);
  v_total_final     NUMERIC(10,2);
BEGIN
  -- ===== 1) Validaciones previas =====
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'p_items debe ser un arreglo JSONB con al menos un item';
  END IF;

  -- Verificar espacio (usando isActive con A mayúscula)
  SELECT 1 INTO v_dummy FROM "Space" s WHERE s.id = p_space_id AND s."isActive" IS TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El espacio % no existe o no está activo', p_space_id;
  END IF;

  -- Verificar usuario (usando isactive en minúsculas)
  SELECT 1 INTO v_dummy FROM "User" u WHERE u.id = p_created_by AND u.isactive IS TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El usuario creador % no existe o no está activo', p_created_by;
  END IF;

  -- ===== 2) Calcular subtotal a partir de items =====
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULL;
    v_combo_id   := NULL;
    v_qty        := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
    v_item_notes := v_item->>'notes';

    IF (v_item ? 'productId') THEN
      v_product_id := (v_item->>'productId')::uuid;

      -- producto habilitado + disponible
      PERFORM 1 FROM "Product" p
       WHERE p.id = v_product_id AND p."isEnabled" IS TRUE AND p."isAvailable" IS TRUE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no existe, no está habilitado o no está disponible', v_product_id;
      END IF;

    ELSIF (v_item ? 'comboId') THEN
      v_combo_id := (v_item->>'comboId')::uuid;

      -- combo habilitado + disponible
      PERFORM 1 FROM "Combo" c
       WHERE c.id = v_combo_id AND c."isEnabled" IS TRUE AND c."isAvailable" IS TRUE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Combo % no existe, no está habilitado o no está disponible', v_combo_id;
      END IF;

    ELSE
      RAISE EXCEPTION 'Cada item debe tener productId o comboId. Item: %', v_item;
    END IF;

    -- precio unitario (param o catálogo)
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

  -- ===== 3) Totales =====
  v_discount_final := COALESCE(p_discount, 0);
  v_tax_final      := COALESCE(p_tax, 0);
  v_subtotal_final := COALESCE(p_subtotal, v_subtotal_calc);
  v_total_final    := COALESCE(p_total_amount, v_subtotal_final + v_tax_final - v_discount_final);

  -- ===== 4) Insertar cabecera (alias + RETURNING explícito) =====
  INSERT INTO "Order" AS o (
    "spaceId", "customerName", "customerPhone",
    status, "totalAmount", subtotal, tax, discount,
    notes, "createdBy", "createdAt", "updatedAt"
  ) VALUES (
    p_space_id, p_customer_name, p_customer_phone,
    'PENDIENTE', v_total_final, v_subtotal_final, v_tax_final, v_discount_final,
    p_notes, p_created_by, NOW(), NOW()
  )
  RETURNING o.id, o."orderNumber" INTO v_order_id, v_order_number;

  -- si el trigger no generó número, forzar uno
  IF v_order_number IS NULL OR v_order_number = '' THEN
    UPDATE "Order" AS o
       SET "orderNumber" = 'ORD' || TO_CHAR(NOW(), 'YYMMDDHH24MISS') || LPAD(FLOOR(RANDOM()*100)::TEXT, 2, '0')
     WHERE o.id = v_order_id
    RETURNING o."orderNumber" INTO v_order_number;
  END IF;

  -- ===== 5) Insertar ítems (y componentes si vienen) =====
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
    )
    RETURNING id INTO v_order_item_id;

    -- componentes opcionales (si el item trae "components": [])
    IF (v_item ? 'components') AND jsonb_typeof(v_item->'components') = 'array' THEN
      FOR v_comp IN SELECT * FROM jsonb_array_elements(v_item->'components')
      LOOP
        v_comp_id   := NULLIF(v_comp->>'comboComponentId','')::uuid;
        v_comp_qty  := GREATEST(1, COALESCE((v_comp->>'quantity')::int, 1));
        v_comp_notes:= v_comp->>'notes';

        -- completar nombre/tipo/precio desde catálogo si no vienen
        IF v_comp_id IS NOT NULL THEN
          IF (v_comp ? 'name') THEN
            v_comp_name := v_comp->>'name';
          ELSE
            SELECT cc.name INTO v_comp_name FROM "ComboComponent" cc WHERE cc.id = v_comp_id;
          END IF;

          IF (v_comp ? 'type') THEN
            v_comp_type := v_comp->>'type';
          ELSE
            SELECT cc.type INTO v_comp_type FROM "ComboComponent" cc WHERE cc.id = v_comp_id;
          END IF;

          IF (v_comp ? 'price') THEN
            v_comp_price := (v_comp->>'price')::numeric;
          ELSE
            SELECT COALESCE(cc.price,0)::numeric INTO v_comp_price FROM "ComboComponent" cc WHERE cc.id = v_comp_id;
          END IF;
        ELSE
          -- si no hay id, requiere al menos name y type
          v_comp_name  := NULLIF(v_comp->>'name','');
          v_comp_type  := NULLIF(v_comp->>'type','');
          v_comp_price := COALESCE((v_comp->>'price')::numeric, 0);
          IF v_comp_name IS NULL OR v_comp_type IS NULL THEN
            RAISE EXCEPTION 'Componente de item inválido (falta comboComponentId o name/type): %', v_comp;
          END IF;
        END IF;

        INSERT INTO "OrderItemComponent"(
          "orderItemId","comboComponentId",name,type,price,quantity,notes,"createdAt"
        ) VALUES (
          v_order_item_id, v_comp_id, v_comp_name, v_comp_type, v_comp_price, v_comp_qty, v_comp_notes, NOW()
        );
      END LOOP;
    END IF;

  END LOOP;

  -- ===== 6) Recalcular totales cabecera =====
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

  -- ===== 7) Estado del espacio =====
  UPDATE "Space" s
     SET status = 'OCUPADA',
         "updatedAt" = NOW()
   WHERE s.id = p_space_id;

  -- ===== 8) Historial inicial =====
  INSERT INTO "OrderStatusHistory"("orderId","status","changedBy","notes","createdAt")
  VALUES (v_order_id, 'PENDIENTE', p_created_by, 'Creación de pedido', NOW());

  -- ===== 9) Salida =====
  id := v_order_id;
  ordernumber := v_order_number;
  RETURN NEXT;
  RETURN;
END;
$$;

-- Permisos para PostgREST/Supabase
REVOKE ALL ON FUNCTION public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
) TO anon, authenticated;

-- (opcional) si puedes, que el owner sea postgres (ignora si no hay privilegios)
DO $owner$
BEGIN
  BEGIN
    ALTER FUNCTION public.create_order_with_items(
      UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
    ) OWNER TO postgres;
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$owner$;

-- refrescar esquema API
SELECT pg_notify('pgrst','reload schema');

COMMIT;




