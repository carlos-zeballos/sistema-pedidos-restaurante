-- =====================================================
-- CORRECCIÓN DE FILTROS DE FECHA EN BACKEND
-- Asegurar que las funciones RPC manejen correctamente fechas por defecto
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ACTUALIZAR FUNCIÓN DE REPORTE DE ÓRDENES CON FECHAS POR DEFECTO
-- =====================================================

-- Eliminar función anterior
DROP FUNCTION IF EXISTS public.get_orders_report_by_date(DATE, DATE, TEXT, TEXT, INTEGER, INTEGER);

-- Crear función con manejo mejorado de fechas por defecto
CREATE OR REPLACE FUNCTION public.get_orders_report_by_date(
  p_from_date  DATE    DEFAULT NULL,
  p_to_date    DATE    DEFAULT NULL,
  p_status     TEXT    DEFAULT NULL,
  p_space_type TEXT    DEFAULT NULL,
  p_page       INTEGER DEFAULT 1,
  p_limit      INTEGER DEFAULT 50
)
RETURNS TABLE (
  orders JSONB,
  total  BIGINT
)
LANGUAGE sql
STABLE
AS $$
  WITH bounds AS (
    SELECT
      COALESCE(p_from_date, CURRENT_DATE)::timestamp                         AS from_ts,
      (COALESCE(p_to_date, CURRENT_DATE)::timestamp + interval '1 day')      AS to_ts,
      NULLIF(p_status, '')                           AS status_f,
      NULLIF(p_space_type, '')                       AS type_f,
      GREATEST(p_page, 1)                            AS page_n,
      GREATEST(p_limit, 1)                           AS lim_n
  ),
  base AS (
    SELECT
      o.id,
      o."orderNumber",
      o."createdAt",
      o."customerName",
      o.status,
      COALESCE(o.subtotal,0)    AS subtotal,
      COALESCE(o.tax,0)         AS tax,
      COALESCE(o.discount,0)    AS discount,
      COALESCE(o."totalAmount", 0) AS "originalTotal",
      COALESCE(o."totalAmount", 0) AS "finalTotal",
      s.code                    AS "spaceCode",
      s.name                    AS "spaceName",
      s.type                    AS "spaceType",
      COALESCE(o."isPaid", false) AS "isPaid"
    FROM "Order" o
    JOIN "Space" s ON s.id = o."spaceId"
    CROSS JOIN bounds b
    WHERE o."deletedAt" IS NULL
      AND o."createdAt" >= b.from_ts
      AND o."createdAt" <  b.to_ts
      AND (b.status_f IS NULL OR o.status::text = b.status_f)
      AND (b.type_f   IS NULL OR s.type::text = b.type_f)
  ),
  total_cte AS (
    SELECT COUNT(*) AS total FROM base
  ),
  page AS (
    SELECT *
    FROM base
    ORDER BY "createdAt" DESC
    LIMIT GREATEST(p_limit, 1)
    OFFSET (GREATEST(p_page, 1) - 1) * GREATEST(p_limit, 1)
  ),
  rows AS (
    SELECT
      op."createdAt",
      JSONB_BUILD_OBJECT(
        'id',                op.id,
        'orderNumber',       op."orderNumber",
        'createdAt',         op."createdAt",
        'spaceCode',         op."spaceCode",
        'spaceName',         op."spaceName",
        'spaceType',         op."spaceType",
        'customerName',      op."customerName",
        'status',            op.status,
        'isPaid',           op."isPaid",
        'originalTotal',     op."originalTotal",
        'finalTotal',        op."finalTotal",
        'paidTotal',         pay."paidTotal",
        'deliveryFeeTotal',  pay."deliveryFeeTotal",
        'totalPaid',         pay."totalPaid",
        'payments',          pay.payments
      ) AS row_obj
    FROM page op
    LEFT JOIN LATERAL (
      SELECT
        -- CORRECCIÓN: Solo el monto del pago más reciente (no suma todos)
        COALESCE(
          (
            SELECT p.amount
            FROM "OrderPayment" p
            WHERE p."orderId" = op.id
            ORDER BY p."paymentDate" DESC
            LIMIT 1
          ),
          0
        ) AS "paidTotal",
        -- Delivery fees (solo si es delivery)
        COALESCE(
          (
            SELECT SUM(p.amount)
            FROM "OrderPayment" p
            WHERE p."orderId" = op.id
            AND COALESCE(p."isDeliveryService", false) = true
          ),
          0
        ) AS "deliveryFeeTotal",
        -- Total pagado (suma de todos los pagos)
        COALESCE(
          (
            SELECT SUM(p.amount)
            FROM "OrderPayment" p
            WHERE p."orderId" = op.id
          ),
          0
        ) AS "totalPaid",
        -- Array de pagos
        COALESCE(
          (
            SELECT JSONB_AGG(
              JSONB_BUILD_OBJECT(
                'method',     pm.name,
                'amount',     p.amount,
                'baseAmount', p."baseAmount",
                'surchargeAmount', p."surchargeAmount",
                'isDelivery', COALESCE(p."isDeliveryService", false),
                'paymentDate', p."paymentDate"
              )
              ORDER BY p."paymentDate" DESC
            )
            FROM "OrderPayment" p
            LEFT JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
            WHERE p."orderId" = op.id
          ),
          '[]'::jsonb
        ) AS payments
    ) AS pay ON TRUE
  )
  SELECT
    COALESCE(JSONB_AGG(row_obj ORDER BY "createdAt" DESC), '[]'::jsonb) AS orders,
    (SELECT total FROM total_cte)                                        AS total
  FROM rows;
$$;

-- =====================================================
-- 2. ACTUALIZAR FUNCIÓN DE REPORTE DE MÉTODOS DE PAGO CON FECHAS POR DEFECTO
-- =====================================================

-- Eliminar función anterior
DROP FUNCTION IF EXISTS public.get_payment_methods_report_by_date(DATE, DATE);

-- Crear función con manejo mejorado de fechas por defecto
CREATE OR REPLACE FUNCTION public.get_payment_methods_report_by_date(
  p_from_date DATE DEFAULT NULL,
  p_to_date   DATE DEFAULT NULL
)
RETURNS TABLE (
  "paymentMethodId" UUID,
  method            TEXT,
  icon              TEXT,
  color             TEXT,
  "ordersCount"     BIGINT,
  "finalTotal"      NUMERIC,
  "originalTotal"   NUMERIC,
  "paidByMethod"    NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  WITH bounds AS (
    SELECT
      COALESCE(p_from_date, CURRENT_DATE)::timestamp AS from_ts,
      (COALESCE(p_to_date, CURRENT_DATE)::timestamp + interval '1 day') AS to_ts
  ),
  -- Obtener TODAS las órdenes en el rango de fechas
  orders_in_range AS (
    SELECT 
      o.id,
      o."orderNumber",
      o."totalAmount",
      o.status,
      o."isPaid"
    FROM "Order" o
    CROSS JOIN bounds b
    WHERE o."deletedAt" IS NULL
      AND o."createdAt" >= b.from_ts
      AND o."createdAt" < b.to_ts
  ),
  -- Agregar información de pagos
  orders_with_payments AS (
    SELECT 
      oir.*,
      op."paymentMethodId",
      pm.name as payment_method_name,
      pm.icon,
      pm.color,
      op.amount as payment_amount,
      op."paymentDate",
      ROW_NUMBER() OVER (PARTITION BY oir.id ORDER BY op."paymentDate" DESC) as payment_rank
    FROM orders_in_range oir
    LEFT JOIN "OrderPayment" op ON op."orderId" = oir.id AND COALESCE(op."isDeliveryService", false) = false
    LEFT JOIN "PaymentMethod" pm ON pm.id = op."paymentMethodId"
  ),
  -- Generar reporte final
  report_data AS (
    SELECT 
      COALESCE(owp."paymentMethodId", '00000000-0000-0000-0000-000000000000'::uuid) as "paymentMethodId",
      COALESCE(owp.payment_method_name, 'Sin Pago') as method,
      COALESCE(owp.icon, '❌') as icon,
      COALESCE(owp.color, '#EF4444') as color,
      COUNT(DISTINCT owp.id) as "ordersCount",
      SUM(CASE 
        WHEN owp.payment_method_name IS NOT NULL THEN owp.payment_amount
        ELSE owp."totalAmount"
      END) as "finalTotal",
      SUM(CASE 
        WHEN owp.payment_method_name IS NOT NULL THEN owp.payment_amount
        ELSE owp."totalAmount"
      END) as "originalTotal",
      SUM(CASE 
        WHEN owp.payment_method_name IS NOT NULL THEN owp.payment_amount
        ELSE owp."totalAmount"
      END) as "paidByMethod"
    FROM orders_with_payments owp
    WHERE owp.payment_rank = 1 OR owp.payment_method_name IS NULL
    GROUP BY 
      COALESCE(owp."paymentMethodId", '00000000-0000-0000-0000-000000000000'::uuid),
      COALESCE(owp.payment_method_name, 'Sin Pago'),
      COALESCE(owp.icon, '❌'),
      COALESCE(owp.color, '#EF4444')
  )
  SELECT * FROM report_data
  ORDER BY "finalTotal" DESC;
$$;

-- =====================================================
-- 3. ACTUALIZAR FUNCIÓN DE REPORTE DE DELIVERY CON FECHAS POR DEFECTO
-- =====================================================

-- Eliminar función anterior
DROP FUNCTION IF EXISTS public.get_delivery_payments_report_by_date(DATE, DATE);

-- Crear función con manejo mejorado de fechas por defecto
CREATE OR REPLACE FUNCTION public.get_delivery_payments_report_by_date(
  p_from_date DATE DEFAULT NULL,
  p_to_date   DATE DEFAULT NULL
)
RETURNS TABLE (
  "paymentMethodId"     UUID,
  method                TEXT,
  icon                  TEXT,
  color                 TEXT,
  "deliveryOrdersCount" BIGINT,
  "deliveryFeesPaid"    NUMERIC,
  "orderTotalsPaid"     NUMERIC,
  "totalPaid"           NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  WITH bounds AS (
    SELECT
      COALESCE(p_from_date, CURRENT_DATE)::timestamp AS from_ts,
      (COALESCE(p_to_date, CURRENT_DATE)::timestamp + interval '1 day') AS to_ts
  ),
  -- Obtener TODAS las órdenes de delivery en el rango de fechas
  delivery_orders_in_range AS (
    SELECT 
      o.id,
      o."orderNumber",
      o."totalAmount",
      o.status,
      o."isPaid",
      s.type as space_type
    FROM "Order" o
    JOIN "Space" s ON s.id = o."spaceId" AND s.type::text = 'DELIVERY'
    CROSS JOIN bounds b
    WHERE o."deletedAt" IS NULL
      AND o."createdAt" >= b.from_ts
      AND o."createdAt" < b.to_ts
  ),
  -- Agregar información de pagos de delivery
  delivery_orders_with_payments AS (
    SELECT 
      doir.*,
      op."paymentMethodId",
      pm.name as payment_method_name,
      pm.icon,
      pm.color,
      op.amount as payment_amount,
      op."surchargeAmount",
      op."isDeliveryService",
      op."paymentDate",
      ROW_NUMBER() OVER (PARTITION BY doir.id ORDER BY op."paymentDate" DESC) as payment_rank
    FROM delivery_orders_in_range doir
    LEFT JOIN "OrderPayment" op ON op."orderId" = doir.id AND COALESCE(op."isDeliveryService", false) = true
    LEFT JOIN "PaymentMethod" pm ON pm.id = op."paymentMethodId"
  ),
  -- Generar reporte final
  report_data AS (
    SELECT 
      COALESCE(dowp."paymentMethodId", '00000000-0000-0000-0000-000000000000'::uuid) as "paymentMethodId",
      COALESCE(dowp.payment_method_name, 'Sin Pago') as method,
      COALESCE(dowp.icon, '❌') as icon,
      COALESCE(dowp.color, '#EF4444') as color,
      COUNT(DISTINCT dowp.id) as "deliveryOrdersCount",
      SUM(CASE 
        WHEN dowp.payment_method_name IS NOT NULL THEN COALESCE(dowp."surchargeAmount", dowp.payment_amount)
        ELSE 0
      END) as "deliveryFeesPaid",
      SUM(CASE 
        WHEN dowp.payment_method_name IS NOT NULL THEN dowp.payment_amount
        ELSE dowp."totalAmount"
      END) as "orderTotalsPaid",
      SUM(CASE 
        WHEN dowp.payment_method_name IS NOT NULL THEN dowp.payment_amount
        ELSE dowp."totalAmount"
      END) as "totalPaid"
    FROM delivery_orders_with_payments dowp
    WHERE dowp.payment_rank = 1 OR dowp.payment_method_name IS NULL
    GROUP BY 
      COALESCE(dowp."paymentMethodId", '00000000-0000-0000-0000-000000000000'::uuid),
      COALESCE(dowp.payment_method_name, 'Sin Pago'),
      COALESCE(dowp.icon, '❌'),
      COALESCE(dowp.color, '#EF4444')
  )
  SELECT * FROM report_data
  ORDER BY "totalPaid" DESC;
$$;

-- =====================================================
-- 4. PERMISOS
-- =====================================================

-- Permisos para las funciones
REVOKE ALL ON FUNCTION public.get_orders_report_by_date(DATE, DATE, TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_orders_report_by_date(DATE, DATE, TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_payment_methods_report_by_date(DATE, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_payment_methods_report_by_date(DATE, DATE) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_delivery_payments_report_by_date(DATE, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_delivery_payments_report_by_date(DATE, DATE) TO anon, authenticated;

COMMIT;

-- =====================================================
-- VERIFICACIÓN DE FECHAS POR DEFECTO
-- =====================================================

-- Probar con fechas NULL (debería usar CURRENT_DATE)
SELECT 
  'PRUEBA: FECHAS POR DEFECTO' as categoria,
  'Órdenes (fechas NULL)' as descripcion,
  jsonb_array_length(orders) as cantidad_ordenes,
  total as total_registros
FROM public.get_orders_report_by_date(NULL, NULL, NULL, NULL, 1, 10);

-- Probar con fechas específicas
SELECT 
  'PRUEBA: FECHAS ESPECÍFICAS' as categoria,
  'Órdenes (hoy)' as descripcion,
  jsonb_array_length(orders) as cantidad_ordenes,
  total as total_registros
FROM public.get_orders_report_by_date(CURRENT_DATE, CURRENT_DATE, NULL, NULL, 1, 10);

-- Probar métodos de pago con fechas NULL
SELECT 
  'PRUEBA: MÉTODOS DE PAGO (fechas NULL)' as categoria,
  method,
  "ordersCount",
  "finalTotal"
FROM public.get_payment_methods_report_by_date(NULL, NULL)
LIMIT 3;

-- Probar delivery con fechas NULL
SELECT 
  'PRUEBA: DELIVERY (fechas NULL)' as categoria,
  method,
  "deliveryOrdersCount",
  "totalPaid"
FROM public.get_delivery_payments_report_by_date(NULL, NULL)
LIMIT 3;
