-- =====================================================
-- CORRECCIÓN DE LA FUNCIÓN RPC get_orders_report_by_date
-- Problema: paidTotal está sumando TODOS los pagos en lugar del pago final
-- Solución: Mostrar solo el monto del método de pago más reciente
-- =====================================================

BEGIN;

-- 1) Eliminar la función RPC existente si existe
DROP FUNCTION IF EXISTS public.get_orders_report_by_date(
  DATE,
  DATE,
  TEXT,
  TEXT
);

-- 2) Crear la función RPC corregida
CREATE OR REPLACE FUNCTION public.get_orders_report_by_date(
  p_start_date DATE,
  p_end_date DATE,
  p_status TEXT DEFAULT NULL,
  p_space_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  "orderNumber" TEXT,
  "customerName" TEXT,
  "customerPhone" TEXT,
  status TEXT,
  "totalAmount" NUMERIC(10,2),
  subtotal NUMERIC(10,2),
  tax NUMERIC(10,2),
  discount NUMERIC(10,2),
  "finalTotal" NUMERIC(10,2),
  "originalTotal" NUMERIC(10,2),
  "paidTotal" NUMERIC(10,2),
  "spaceId" UUID,
  "spaceName" TEXT,
  "spaceType" TEXT,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP,
  "createdBy" UUID,
  "assignedTo" UUID,
  notes TEXT,
  "isPaid" BOOLEAN,
  payments JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o."orderNumber",
    o."customerName",
    o."customerPhone",
    o.status::TEXT,
    o."totalAmount",
    o.subtotal,
    o.tax,
    o.discount,
    o."totalAmount" AS "finalTotal",  -- Total final es el totalAmount
    o."totalAmount" AS "originalTotal", -- Para compatibilidad
    -- CORRECCIÓN: Solo el monto del pago más reciente (no suma todos)
    COALESCE(
      (
        SELECT op.amount 
        FROM "OrderPayment" op 
        WHERE op."orderId" = o.id 
        ORDER BY op."paymentDate" DESC 
        LIMIT 1
      ), 
      0
    ) AS "paidTotal",
    o."spaceId",
    s.name AS "spaceName",
    s.type::TEXT AS "spaceType",
    o."createdAt",
    o."updatedAt",
    o."createdBy",
    o."assignedTo",
    o.notes,
    COALESCE(o."isPaid", false) AS "isPaid",
    -- Pagos como JSONB para el frontend
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', op.id,
            'amount', op.amount,
            'baseAmount', op."baseAmount",
            'surchargeAmount', op."surchargeAmount",
            'isDelivery', op."isDeliveryService",
            'method', pm.name,
            'paymentDate', op."paymentDate",
            'createdAt', op."createdAt"
          )
        )
        FROM "OrderPayment" op
        JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
        WHERE op."orderId" = o.id
        ORDER BY op."paymentDate" DESC
      ),
      '[]'::jsonb
    ) AS payments
  FROM "Order" o
  JOIN "Space" s ON o."spaceId" = s.id
  WHERE 
    DATE(o."createdAt") BETWEEN p_start_date AND p_end_date
    AND (p_status IS NULL OR o.status = p_status::order_status)
    AND (p_space_type IS NULL OR s.type = p_space_type::space_type)
  ORDER BY o."createdAt" DESC;
END;
$$;

-- 3) Permisos para que el backend pueda ejecutar la función
REVOKE ALL ON FUNCTION public.get_orders_report_by_date(
  DATE, DATE, TEXT, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_orders_report_by_date(
  DATE, DATE, TEXT, TEXT
) TO anon, authenticated;

-- 4) Intentar cambiar el owner a postgres (ignora si no hay privilegios)
DO $owner$
BEGIN
  BEGIN
    ALTER FUNCTION public.get_orders_report_by_date(
      DATE, DATE, TEXT, TEXT
    ) OWNER TO postgres;
  EXCEPTION WHEN insufficient_privilege THEN
    NULL; -- Ignorar si no se puede cambiar el owner
  END;
END;
$owner$;

-- 5) Refrescar el esquema de la API (PostgREST/Supabase)
SELECT pg_notify('pgrst','reload schema');

COMMIT;

-- =====================================================
-- VERIFICACIÓN DE LA CORRECCIÓN
-- =====================================================

-- Probar la función con datos de ejemplo
-- SELECT * FROM public.get_orders_report_by_date(
--   CURRENT_DATE - INTERVAL '7 days',
--   CURRENT_DATE,
--   NULL,
--   NULL
-- ) LIMIT 5;

-- Verificar que paidTotal ya no esté duplicado
-- SELECT 
--   "orderNumber",
--   "finalTotal",
--   "paidTotal",
--   ("paidTotal" = "finalTotal") AS "correct_payment"
-- FROM public.get_orders_report_by_date(
--   CURRENT_DATE - INTERVAL '7 days',
--   CURRENT_DATE,
--   NULL,
--   NULL
-- )
-- WHERE "paidTotal" > 0
-- ORDER BY "createdAt" DESC
-- LIMIT 10;
