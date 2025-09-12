-- =========================================================
-- LIMPIEZA COMPLETA Y RPC FINAL
-- =========================================================
-- Paso 1: Limpiar triggers viejos y crear el correcto
-- Paso 2: Crear RPC con nombres exactos de columnas
-- =========================================================

-- =========================================================
-- PASO 1: LIMPIAR TRIGGERS Y CREAR EL CORRECTO
-- =========================================================

BEGIN;

-- borra el trigger antiguo que usaba NEW.ordernumber (casing malo)
DROP TRIGGER IF EXISTS trigger_generate_order_number ON public."Order";
DROP FUNCTION IF EXISTS public.generate_order_number();

-- crea/asegura la secuencia y el trigger bueno
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq OWNED BY NONE;

CREATE OR REPLACE FUNCTION public.fill_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW."orderNumber" IS NULL OR NEW."orderNumber" = '' THEN
    NEW."orderNumber" :=
      'ORD' || TO_CHAR(CURRENT_TIMESTAMP,'YYMMDD') ||
      LPAD(nextval('public.order_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.order_number_seq TO anon, authenticated;

DROP TRIGGER IF EXISTS trg_fill_order_number ON public."Order";
CREATE TRIGGER trg_fill_order_number
BEFORE INSERT ON public."Order"
FOR EACH ROW
EXECUTE FUNCTION public.fill_order_number();

SELECT pg_notify('pgrst','reload schema');
COMMIT;

-- =========================================================
-- PASO 2: CREAR RPC CON NOMBRES EXACTOS DE COLUMNAS
-- =========================================================

BEGIN;

-- borra la firma anterior si existía con el mismo nombre
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
RETURNS TABLE ("id" UUID, "orderNumber" TEXT)
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
  -- 1) Validación de items
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'p_items debe ser un arreglo JSONB con al menos un item';
  END IF;

  -- 2) Calcular subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty        := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
    v_item_notes := v_item->>'notes';
    v_product_id := NULL;
    v_combo_id   := NULL;

    IF (v_item ? 'productId') THEN
      v_product_id := (v_item->>'productId')::uuid;
      SELECT p.price::numeric, p.name INTO v_unit_price, v_name FROM "Product" p WHERE p.id = v_product_id;
    ELSIF (v_item ? 'comboId') THEN
      v_combo_id := (v_item->>'comboId')::uuid;
      SELECT c."basePrice"::numeric, c.name INTO v_unit_price, v_name FROM "Combo" c WHERE c.id = v_combo_id;
    ELSE
      RAISE EXCEPTION 'Cada item debe tener productId o comboId. Item: %', v_item;
    END IF;

    IF (v_item ? 'unitPrice') THEN
      v_unit_price := (v_item->>'unitPrice')::numeric;
    END IF;
    IF COALESCE(v_item->>'name','') <> '' THEN
      v_name := v_item->>'name';
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

  -- 4) Cabecera + RETURNING (todo calificado)
  INSERT INTO "Order" (
    "spaceId","customerName","customerPhone",
    status,"totalAmount",subtotal,tax,discount,
    notes,"createdBy","createdAt","updatedAt"
  ) VALUES (
    p_space_id,p_customer_name,p_customer_phone,
    'PENDIENTE',v_total_final,v_subtotal_final,v_tax_final,v_discount_final,
    p_notes,p_created_by,NOW(),NOW()
  )
  RETURNING "Order".id, "Order"."orderNumber"
  INTO v_order_id, v_order_number;

  -- por si el trigger no lo puso (no debería pasar)
  IF v_order_number IS NULL OR v_order_number = '' THEN
    UPDATE "Order" o
       SET "orderNumber" = 'ORD' || TO_CHAR(NOW(),'YYMMDD') ||
                           LPAD(nextval('public.order_number_seq')::text,6,'0')
     WHERE o.id = v_order_id
    RETURNING o."orderNumber" INTO v_order_number;
  END IF;

  -- 5) Insertar items (usa nombres **lowercase**)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty        := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
    v_item_notes := v_item->>'notes';
    v_product_id := NULL;
    v_combo_id   := NULL;

    IF (v_item ? 'productId') THEN
      v_product_id := (v_item->>'productId')::uuid;
      SELECT p.price::numeric, p.name INTO v_unit_price, v_name FROM "Product" p WHERE p.id = v_product_id;
    ELSIF (v_item ? 'comboId') THEN
      v_combo_id := (v_item->>'comboId')::uuid;
      SELECT c."basePrice"::numeric, c.name INTO v_unit_price, v_name FROM "Combo" c WHERE c.id = v_combo_id;
    END IF;

    IF (v_item ? 'unitPrice') THEN
      v_unit_price := (v_item->>'unitPrice')::numeric;
    END IF;
    IF COALESCE(v_item->>'name','') <> '' THEN
      v_name := v_item->>'name';
    END IF;

    INSERT INTO "OrderItem"(
      orderid, productid, comboid, name,
      quantity, unitprice, totalprice, notes, status, createdat
    ) VALUES (
      v_order_id, v_product_id, v_combo_id, v_name,
      v_qty, v_unit_price, (v_unit_price * v_qty), v_item_notes, 'PENDIENTE', NOW()
    );
  END LOOP;

  -- 6) Recalcular totales cabecera
  WITH s AS (
    SELECT COALESCE(SUM(oi.totalprice),0)::numeric(10,2) AS sum_items
    FROM "OrderItem" oi
    WHERE oi.orderid = v_order_id
  )
  UPDATE "Order" o
     SET subtotal = s.sum_items,
         "totalAmount" = (s.sum_items + v_tax_final - v_discount_final),
         "updatedAt" = NOW()
    FROM s
   WHERE o.id = v_order_id;

  -- 7) Marcar espacio ocupado
  UPDATE "Space" s
     SET status = 'OCUPADA', "updatedAt" = NOW()
   WHERE s.id = p_space_id;

  -- 8) Devolver
  RETURN QUERY SELECT v_order_id, v_order_number;
END;
$$;

-- permisos para PostgREST
REVOKE ALL ON FUNCTION public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_order_with_items(
  UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
) TO anon, authenticated;

SELECT pg_notify('pgrst','reload schema');
COMMIT;












