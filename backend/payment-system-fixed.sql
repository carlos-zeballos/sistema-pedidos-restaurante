-- =====================================================
-- SISTEMA DE MÉTODOS DE PAGO Y REPORTES FINANCIEROS
-- =====================================================

-- 1. Crear tabla de métodos de pago
CREATE TABLE IF NOT EXISTS "PaymentMethod" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "description" text,
  "isActive" boolean DEFAULT true,
  "icon" text,
  "color" text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now()
);

-- 2. Crear tabla de pagos de órdenes
CREATE TABLE IF NOT EXISTS "OrderPayment" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "orderId" uuid NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "paymentMethodId" uuid NOT NULL REFERENCES "PaymentMethod"(id),
  "amount" decimal(10,2) NOT NULL,
  "paymentDate" timestamp with time zone DEFAULT now(),
  "notes" text,
  "waiterId" uuid REFERENCES "User"(id),
  "createdAt" timestamp with time zone DEFAULT now()
);

-- 3. Agregar campos de pago a la tabla Order (si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Order' AND column_name = 'paymentStatus') THEN
        ALTER TABLE "Order" ADD COLUMN "paymentStatus" text DEFAULT 'PENDIENTE';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Order' AND column_name = 'paymentDate') THEN
        ALTER TABLE "Order" ADD COLUMN "paymentDate" timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Order' AND column_name = 'paymentMethodId') THEN
        ALTER TABLE "Order" ADD COLUMN "paymentMethodId" uuid REFERENCES "PaymentMethod"(id);
    END IF;
END $$;

-- 4. Insertar métodos de pago por defecto
INSERT INTO "PaymentMethod" ("name", "description", "icon", "color") VALUES
  ('EFECTIVO', 'Pago en efectivo', '💰', '#10b981'),
  ('YAPE', 'Pago por Yape', '📱', '#3b82f6'),
  ('TRANSFERENCIA', 'Transferencia bancaria', '🏦', '#8b5cf6'),
  ('PEDIDOSYA', 'Pago por PedidosYa o App', '📦', '#f59e0b'),
  ('TARJETA', 'Pago con tarjeta de crédito/débito', '💳', '#ef4444')
ON CONFLICT ("name") DO NOTHING;

-- 5. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS "idx_orderpayment_orderid" ON "OrderPayment"("orderId");
CREATE INDEX IF NOT EXISTS "idx_orderpayment_method" ON "OrderPayment"("paymentMethodId");
CREATE INDEX IF NOT EXISTS "idx_orderpayment_date" ON "OrderPayment"("paymentDate");
CREATE INDEX IF NOT EXISTS "idx_order_paymentstatus" ON "Order"("paymentStatus");
CREATE INDEX IF NOT EXISTS "idx_order_paymentdate" ON "Order"("paymentDate");

-- 6. Crear función para obtener reporte de caja por fecha
CREATE OR REPLACE FUNCTION get_cash_report_by_date(
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone
)
RETURNS TABLE (
  payment_method text,
  total_amount decimal(10,2),
  order_count bigint,
  method_icon text,
  method_color text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.name::text as payment_method,
    COALESCE(SUM(op.amount), 0) as total_amount,
    COUNT(DISTINCT op."orderId") as order_count,
    pm.icon as method_icon,
    pm.color as method_color
  FROM "PaymentMethod" pm
  LEFT JOIN "OrderPayment" op ON pm.id = op."paymentMethodId"
  LEFT JOIN "Order" o ON op."orderId" = o.id
  WHERE pm."isActive" = true
    AND (op."paymentDate" IS NULL OR (op."paymentDate" >= p_start_date AND op."paymentDate" <= p_end_date))
  GROUP BY pm.id, pm.name, pm.icon, pm.color
  ORDER BY pm.name;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear función para obtener reporte detallado de órdenes pagadas
CREATE OR REPLACE FUNCTION get_paid_orders_report(
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone
)
RETURNS TABLE (
  order_number text,
  customer_name text,
  space_name text,
  total_amount decimal(10,2),
  payment_method text,
  payment_date timestamp with time zone,
  waiter_name text,
  items_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o."orderNumber"::text as order_number,
    o."customerName"::text as customer_name,
    s.name::text as space_name,
    o."totalAmount" as total_amount,
    pm.name::text as payment_method,
    op."paymentDate" as payment_date,
    u.name::text as waiter_name,
    (SELECT COUNT(*) FROM "OrderItem" oi WHERE oi."orderId" = o.id) as items_count
  FROM "Order" o
  INNER JOIN "OrderPayment" op ON o.id = op."orderId"
  INNER JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
  LEFT JOIN "Space" s ON o."spaceId" = s.id
  LEFT JOIN "User" u ON op."waiterId" = u.id
  WHERE o."paymentStatus" = 'PAGADO'
    AND op."paymentDate" >= p_start_date 
    AND op."paymentDate" <= p_end_date
  ORDER BY op."paymentDate" DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear función para obtener estadísticas de ventas por hora
CREATE OR REPLACE FUNCTION get_sales_by_hour(
  p_date date
)
RETURNS TABLE (
  hour_of_day integer,
  total_amount decimal(10,2),
  order_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(hour FROM op."paymentDate")::integer as hour_of_day,
    COALESCE(SUM(op.amount), 0) as total_amount,
    COUNT(DISTINCT op."orderId") as order_count
  FROM "OrderPayment" op
  INNER JOIN "Order" o ON op."orderId" = o.id
  WHERE o."paymentStatus" = 'PAGADO'
    AND DATE(op."paymentDate") = p_date
  GROUP BY EXTRACT(hour FROM op."paymentDate")
  ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear vista para reportes rápidos
CREATE OR REPLACE VIEW "v_payment_summary" AS
SELECT 
  pm.name as payment_method,
  pm.icon,
  pm.color,
  COUNT(DISTINCT op."orderId") as total_orders,
  COALESCE(SUM(op.amount), 0) as total_amount,
  AVG(op.amount) as average_amount
FROM "PaymentMethod" pm
LEFT JOIN "OrderPayment" op ON pm.id = op."paymentMethodId"
LEFT JOIN "Order" o ON op."orderId" = o.id AND o."paymentStatus" = 'PAGADO'
WHERE pm."isActive" = true
GROUP BY pm.id, pm.name, pm.icon, pm.color
ORDER BY pm.name;

-- 10. Crear trigger para actualizar automáticamente el estado de pago
CREATE OR REPLACE FUNCTION update_order_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el estado de pago en la tabla Order
  UPDATE "Order" 
  SET 
    "paymentStatus" = 'PAGADO',
    "paymentDate" = NEW."paymentDate",
    "paymentMethodId" = NEW."paymentMethodId",
    "updatedAt" = now()
  WHERE id = NEW."orderId";
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger si no existe
DROP TRIGGER IF EXISTS trigger_update_order_payment_status ON "OrderPayment";
CREATE TRIGGER trigger_update_order_payment_status
  AFTER INSERT ON "OrderPayment"
  FOR EACH ROW
  EXECUTE FUNCTION update_order_payment_status();

-- 11. Crear función para obtener resumen del día actual
CREATE OR REPLACE FUNCTION get_today_summary()
RETURNS TABLE (
  total_orders bigint,
  total_amount decimal(10,2),
  payment_methods json
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT op."orderId") as total_orders,
    COALESCE(SUM(op.amount), 0) as total_amount,
    json_agg(
      json_build_object(
        'method', pm.name,
        'amount', method_total.total_amount,
        'count', method_total.order_count,
        'icon', pm.icon,
        'color', pm.color
      )
    ) as payment_methods
  FROM "OrderPayment" op
  INNER JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
  INNER JOIN (
    SELECT 
      op2."paymentMethodId",
      SUM(op2.amount) as total_amount,
      COUNT(DISTINCT op2."orderId") as order_count
    FROM "OrderPayment" op2
    WHERE DATE(op2."paymentDate") = CURRENT_DATE
    GROUP BY op2."paymentMethodId"
  ) method_total ON pm.id = method_total."paymentMethodId"
  WHERE DATE(op."paymentDate") = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Mensaje de confirmación
SELECT 'Sistema de métodos de pago implementado exitosamente!' as status;


