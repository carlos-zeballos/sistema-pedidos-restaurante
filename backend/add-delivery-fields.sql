-- Script para agregar campos de delivery a la tabla Order
-- Ejecutar este script en la base de datos para habilitar el sistema de delivery

-- Agregar campos de delivery a la tabla Order
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "deliveryCost" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "orderPaymentMethodId" UUID,
ADD COLUMN IF NOT EXISTS "deliveryPaymentMethodId" UUID,
ADD COLUMN IF NOT EXISTS "isDelivery" BOOLEAN DEFAULT false;

-- Agregar comentarios para documentar los nuevos campos
COMMENT ON COLUMN "Order"."deliveryCost" IS 'Costo de envío para órdenes de delivery';
COMMENT ON COLUMN "Order"."orderPaymentMethodId" IS 'Método de pago para la orden principal';
COMMENT ON COLUMN "Order"."deliveryPaymentMethodId" IS 'Método de pago para el costo de delivery';
COMMENT ON COLUMN "Order"."isDelivery" IS 'Indica si la orden es de delivery';

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_order_is_delivery ON "Order"("isDelivery");
CREATE INDEX IF NOT EXISTS idx_order_delivery_cost ON "Order"("deliveryCost") WHERE "deliveryCost" > 0;

-- Actualizar la función create_order_with_items para incluir los nuevos campos
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_space_id uuid,
  p_created_by uuid,
  p_customer_name text default null,
  p_customer_phone text default null,
  p_total_amount numeric default 0,
  p_subtotal numeric default 0,
  p_tax numeric default 0,
  p_discount numeric default 0,
  p_notes text default null,
  p_items jsonb default '[]'::jsonb,
  p_delivery_cost numeric default 0,
  p_is_delivery boolean default false
)
RETURNS TABLE (id uuid, orderNumber text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_counter integer;
  v_space_type text;
BEGIN
  -- Verificar si el espacio es de tipo DELIVERY
  SELECT type INTO v_space_type FROM "Space" WHERE id = p_space_id;
  
  -- Si el espacio contiene 'delivery' en el nombre o es tipo DELIVERY, marcar como delivery
  IF v_space_type = 'DELIVERY' OR p_is_delivery THEN
    p_is_delivery := true;
    -- Si no se especifica costo de delivery, usar un valor por defecto
    IF p_delivery_cost = 0 THEN
      p_delivery_cost := 5.00; -- Costo por defecto de delivery
    END IF;
  END IF;

  -- Generate order number
  SELECT coalesce(max(cast(substring("orderNumber" from 4) as integer)), 0) + 1
  INTO v_counter
  FROM "Order";
  
  v_order_number := 'ORD' || lpad(v_counter::text, 6, '0');
  
  -- Insert order with delivery fields
  INSERT INTO "Order" (
    "orderNumber", "spaceId", "customerName", "customerPhone", status,
    "totalAmount", subtotal, tax, discount, notes, "createdBy",
    "deliveryCost", "isDelivery", "createdAt", "updatedAt"
  ) VALUES (
    v_order_number, p_space_id, p_customer_name, p_customer_phone, 'PENDIENTE',
    coalesce(p_total_amount, 0), coalesce(p_subtotal, 0), coalesce(p_tax, 0), coalesce(p_discount, 0), p_notes, p_created_by,
    coalesce(p_delivery_cost, 0), coalesce(p_is_delivery, false), now(), now()
  ) RETURNING id INTO v_order_id;

  -- Insert items
  IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
    INSERT INTO "OrderItem" (
      "orderId", "productId", "comboId", name, "unitPrice", "totalPrice", quantity, status, notes, "createdAt"
    )
    SELECT
      v_order_id,
      CASE WHEN coalesce(item->>'productId','') <> '' THEN (item->>'productId')::uuid ELSE NULL END,
      CASE WHEN coalesce(item->>'comboId','') <> '' THEN (item->>'comboId')::uuid ELSE NULL END,
      item->>'name',
      coalesce((item->>'unitPrice')::numeric, 0),
      coalesce((item->>'totalPrice')::numeric, 0),
      coalesce((item->>'quantity')::int, 1),
      'PENDIENTE',
      item->>'notes',
      now()
    FROM jsonb_array_elements(p_items) AS item;
  END IF;

  -- Mark space as occupied
  UPDATE "Space" SET status = 'OCUPADA', "updatedAt" = now() WHERE id = p_space_id;

  RETURN QUERY SELECT v_order_id, v_order_number;
END;
$$;

-- Actualizar permisos
REVOKE ALL ON FUNCTION create_order_with_items(uuid, uuid, text, text, numeric, numeric, numeric, numeric, text, jsonb, numeric, boolean) FROM public;
GRANT EXECUTE ON FUNCTION create_order_with_items(uuid, uuid, text, text, numeric, numeric, numeric, numeric, text, jsonb, numeric, boolean) TO anon, authenticated;

-- Crear función para actualizar métodos de pago de una orden
CREATE OR REPLACE FUNCTION update_order_payment_methods(
  p_order_id uuid,
  p_order_payment_method_id uuid,
  p_delivery_payment_method_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE "Order" 
  SET 
    "orderPaymentMethodId" = p_order_payment_method_id,
    "deliveryPaymentMethodId" = p_delivery_payment_method_id,
    "updatedAt" = now()
  WHERE id = p_order_id;
END;
$$;

-- Actualizar permisos
REVOKE ALL ON FUNCTION update_order_payment_methods(uuid, uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION update_order_payment_methods(uuid, uuid, uuid) TO anon, authenticated;

-- Crear vista para reportes de delivery
CREATE OR REPLACE VIEW delivery_orders_report AS
SELECT 
  o.id,
  o."orderNumber",
  o."customerName",
  o."customerPhone",
  o."totalAmount",
  o."deliveryCost",
  o."isDelivery",
  o."createdAt",
  o."updatedAt",
  s.name as space_name,
  s.type as space_type,
  pm1.name as order_payment_method,
  pm2.name as delivery_payment_method,
  u.username as created_by_name
FROM "Order" o
LEFT JOIN "Space" s ON o."spaceId" = s.id
LEFT JOIN "PaymentMethod" pm1 ON o."orderPaymentMethodId" = pm1.id
LEFT JOIN "PaymentMethod" pm2 ON o."deliveryPaymentMethodId" = pm2.id
LEFT JOIN "User" u ON o."createdBy" = u.id
WHERE o."isDelivery" = true;

-- Comentarios para la vista
COMMENT ON VIEW delivery_orders_report IS 'Vista para reportes de órdenes de delivery con información de métodos de pago';

-- Insertar algunos espacios de delivery de ejemplo si no existen
INSERT INTO "Space" (code, name, type, capacity, status, "isActive")
SELECT 'D1', 'Delivery 1', 'DELIVERY', 1, 'LIBRE', true
WHERE NOT EXISTS (SELECT 1 FROM "Space" WHERE code = 'D1');

INSERT INTO "Space" (code, name, type, capacity, status, "isActive")
SELECT 'D2', 'Delivery 2', 'DELIVERY', 1, 'LIBRE', true
WHERE NOT EXISTS (SELECT 1 FROM "Space" WHERE code = 'D2');

INSERT INTO "Space" (code, name, type, capacity, status, "isActive")
SELECT 'D3', 'Delivery 3', 'DELIVERY', 1, 'LIBRE', true
WHERE NOT EXISTS (SELECT 1 FROM "Space" WHERE code = 'D3');

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Campos de delivery agregados exitosamente a la tabla Order';
  RAISE NOTICE '✅ Función create_order_with_items actualizada para soportar delivery';
  RAISE NOTICE '✅ Función update_order_payment_methods creada';
  RAISE NOTICE '✅ Vista delivery_orders_report creada para reportes';
  RAISE NOTICE '✅ Espacios de delivery de ejemplo creados (D1, D2, D3)';
END $$;
   
   