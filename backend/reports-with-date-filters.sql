-- =====================================================
-- FUNCIONES RPC PARA FILTROS DE FECHA EN REPORTES
-- =====================================================

-- Función para obtener reporte de métodos de pago con filtros de fecha
CREATE OR REPLACE FUNCTION get_payment_methods_report_by_date(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE(
  method TEXT,
  icon TEXT,
  color TEXT,
  ordersCount BIGINT,
  finalTotal NUMERIC,
  originalTotal NUMERIC,
  paidByMethod NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.name AS method,
    pm.icon,
    pm.color,
    COUNT(DISTINCT p."orderId") AS ordersCount,
    SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END) AS finalTotal,
    SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false)
             THEN COALESCE(p."baseAmount", p.amount - COALESCE(p."surchargeAmount",0))
             ELSE 0 END) AS originalTotal,
    SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END) AS paidByMethod
  FROM "Order" o
  JOIN "OrderPayment" p ON p."orderId" = o.id
  JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
  WHERE o."deletedAt" IS NULL 
    AND pm."isActive" = true
    AND (p_from_date IS NULL OR DATE(o."createdAt") >= p_from_date)
    AND (p_to_date IS NULL OR DATE(o."createdAt") <= p_to_date)
  GROUP BY pm.id, pm.name, pm.icon, pm.color
  ORDER BY pm.name;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener reporte de delivery con filtros de fecha
CREATE OR REPLACE FUNCTION get_delivery_payments_report_by_date(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE(
  method TEXT,
  icon TEXT,
  color TEXT,
  deliveryOrdersCount BIGINT,
  deliveryFeesPaid NUMERIC,
  orderTotalsPaid NUMERIC,
  totalPaid NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.name AS method,
    pm.icon,
    pm.color,
    COUNT(DISTINCT o.id) AS deliveryOrdersCount,
    SUM(CASE WHEN COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END) AS deliveryFeesPaid,
    SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END) AS orderTotalsPaid,
    SUM(p.amount) AS totalPaid
  FROM "Order" o
  JOIN "Space" s ON s.id = o."spaceId" AND s.type = 'DELIVERY'
  JOIN "OrderPayment" p ON p."orderId" = o.id
  JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
  WHERE o."deletedAt" IS NULL 
    AND pm."isActive" = true
    AND (p_from_date IS NULL OR DATE(o."createdAt") >= p_from_date)
    AND (p_to_date IS NULL OR DATE(o."createdAt") <= p_to_date)
  GROUP BY pm.id, pm.name, pm.icon, pm.color
  ORDER BY pm.name;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener reporte de órdenes con filtros de fecha
CREATE OR REPLACE FUNCTION get_orders_report_by_date(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_space_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  orderNumber TEXT,
  createdAt TIMESTAMP,
  spaceCode TEXT,
  spaceName TEXT,
  spaceType TEXT,
  customerName TEXT,
  status TEXT,
  originalTotal NUMERIC,
  finalTotal NUMERIC,
  paidTotal NUMERIC,
  deliveryFeeTotal NUMERIC,
  totalPaid NUMERIC,
  payments JSONB,
  total_count BIGINT
) AS $$
DECLARE
  v_total_count BIGINT;
BEGIN
  -- Obtener el conteo total
  SELECT COUNT(*)
  INTO v_total_count
  FROM "Order" o
  JOIN "Space" s ON s.id = o."spaceId"
  WHERE o."deletedAt" IS NULL
    AND (p_from_date IS NULL OR DATE(o."createdAt") >= p_from_date)
    AND (p_to_date IS NULL OR DATE(o."createdAt") <= p_to_date)
    AND (p_status IS NULL OR o.status = p_status)
    AND (p_space_type IS NULL OR s.type = p_space_type);

  -- Retornar los datos paginados
  RETURN QUERY
  SELECT
    o.id,
    o."orderNumber",
    o."createdAt",
    s.code AS spaceCode,
    s.name AS spaceName,
    s.type AS spaceType,
    o."customerName",
    o.status,
    COALESCE(o."originalTotal", (COALESCE(o.subtotal,0)+COALESCE(o.tax,0)-COALESCE(o.discount,0))) AS originalTotal,
    COALESCE(o."finalTotal", o."originalTotal", (COALESCE(o.subtotal,0)+COALESCE(o.tax,0)-COALESCE(o.discount,0))) AS finalTotal,
    COALESCE(SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount END),0) AS paidTotal,
    COALESCE(SUM(CASE WHEN COALESCE(p."isDeliveryService",false) THEN p.amount END),0) AS deliveryFeeTotal,
    COALESCE(SUM(p.amount),0) AS totalPaid,
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'method', pm.name,
        'amount', p.amount,
        'isDelivery', COALESCE(p."isDeliveryService",false),
        'paymentDate', p."paymentDate"
      )
    ) FILTER (WHERE p.id IS NOT NULL) AS payments,
    v_total_count
  FROM "Order" o
  JOIN "Space" s ON s.id = o."spaceId"
  LEFT JOIN "OrderPayment" p ON p."orderId" = o.id
  LEFT JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
  WHERE o."deletedAt" IS NULL
    AND (p_from_date IS NULL OR DATE(o."createdAt") >= p_from_date)
    AND (p_to_date IS NULL OR DATE(o."createdAt") <= p_to_date)
    AND (p_status IS NULL OR o.status = p_status)
    AND (p_space_type IS NULL OR s.type = p_space_type)
  GROUP BY o.id, s.code, s.name, s.type
  ORDER BY o."createdAt" DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ¡FUNCIONES RPC COMPLETADAS!
-- =====================================================






