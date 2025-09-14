-- =====================================================
-- FUNCIONES RPC OPTIMIZADAS PARA VISTA DE MOZOS SIMPLE
-- =====================================================

-- Función para obtener órdenes activas simplificadas
CREATE OR REPLACE FUNCTION get_active_orders_for_waiters()
RETURNS TABLE (
  id UUID,
  order_number TEXT,
  customer_name TEXT,
  space_name TEXT,
  status TEXT,
  total_amount DECIMAL(10,2),
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o."orderNumber" as order_number,
    o."customerName" as customer_name,
    COALESCE(s.name, 'Sin mesa') as space_name,
    o.status::text,
    o."totalAmount" as total_amount,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'name', p.name,
          'quantity', oi.quantity,
          'notes', oi.notes
        ) ORDER BY oi."createdAt"
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'::jsonb
    ) as items,
    o."createdAt" as created_at
  FROM "Order" o
  LEFT JOIN "Space" s ON o."spaceId" = s.id
  LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
  LEFT JOIN "Product" p ON oi."productId" = p.id
  WHERE o.status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO')
  GROUP BY o.id, o."orderNumber", o."customerName", s.name, o.status, o."totalAmount", o."createdAt"
  ORDER BY o."createdAt" DESC;
END;
$$;

-- Función para crear orden simplificada
CREATE OR REPLACE FUNCTION create_simple_order(
  p_space_id UUID,
  p_customer_name TEXT,
  p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_total_amount DECIMAL(10,2) := 0;
  v_item JSONB;
  v_product_price DECIMAL(10,2);
BEGIN
  -- Generar número de orden
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SUBSTRING("orderNumber" FROM 14) AS INTEGER)), 0) + 1 
     FROM "Order" 
     WHERE "orderNumber" LIKE 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%'), 
    4, '0'
  );

  -- Calcular total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT price INTO v_product_price 
    FROM "Product" 
    WHERE id = (v_item->>'productId')::UUID;
    
    v_total_amount := v_total_amount + (v_product_price * (v_item->>'quantity')::INTEGER);
  END LOOP;

  -- Crear orden
  INSERT INTO "Order" (
    "orderNumber",
    "customerName",
    "spaceId",
    status,
    "totalAmount",
    "createdAt",
    "updatedAt"
  ) VALUES (
    v_order_number,
    p_customer_name,
    p_space_id,
    'PENDIENTE',
    v_total_amount,
    NOW(),
    NOW()
  ) RETURNING id INTO v_order_id;

  -- Crear items de la orden
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO "OrderItem" (
      "orderId",
      "productId",
      quantity,
      status,
      "createdAt",
      "updatedAt"
    ) VALUES (
      v_order_id,
      (v_item->>'productId')::UUID,
      (v_item->>'quantity')::INTEGER,
      'PENDIENTE',
      NOW(),
      NOW()
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Función para obtener estadísticas rápidas
CREATE OR REPLACE FUNCTION get_waiters_dashboard_stats()
RETURNS TABLE (
  total_orders INTEGER,
  pending_orders INTEGER,
  in_preparation_orders INTEGER,
  ready_orders INTEGER,
  total_revenue DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_orders,
    COUNT(*) FILTER (WHERE status = 'PENDIENTE')::INTEGER as pending_orders,
    COUNT(*) FILTER (WHERE status = 'EN_PREPARACION')::INTEGER as in_preparation_orders,
    COUNT(*) FILTER (WHERE status = 'LISTO')::INTEGER as ready_orders,
    COALESCE(SUM("totalAmount") FILTER (WHERE status = 'PAGADO'), 0) as total_revenue
  FROM "Order"
  WHERE status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'PAGADO')
  AND "createdAt" >= CURRENT_DATE;
END;
$$;

-- Función para verificar si una mesa está disponible
CREATE OR REPLACE FUNCTION is_space_available(p_space_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_active_orders INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_active_orders
  FROM "Order"
  WHERE "spaceId" = p_space_id
  AND status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO');
  
  RETURN v_active_orders = 0;
END;
$$;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_order_status_created_at ON "Order" (status, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_order_space_status ON "Order" ("spaceId", status);
CREATE INDEX IF NOT EXISTS idx_orderitem_order_id ON "OrderItem" ("orderId");
CREATE INDEX IF NOT EXISTS idx_product_available ON "Product" (isAvailable) WHERE isAvailable = true;
CREATE INDEX IF NOT EXISTS idx_space_active ON "Space" (isActive) WHERE isActive = true;
