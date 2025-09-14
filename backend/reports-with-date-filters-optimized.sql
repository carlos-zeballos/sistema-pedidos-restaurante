-- =========================================
-- RPC DE REPORTES CON FILTROS DE FECHA (SARGABLES)
-- =========================================
SET search_path = public;

-- -----------------------------------------
-- 1) Métodos de pago por fecha (por fecha de creación de la Orden)
-- -----------------------------------------
CREATE OR REPLACE FUNCTION get_payment_methods_report_by_date(
  p_from_date DATE DEFAULT CURRENT_DATE,
  p_to_date   DATE DEFAULT CURRENT_DATE
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
      p_from_date::timestamp AS from_ts,
      (p_to_date::timestamp + interval '1 day') AS to_ts
  )
  SELECT
    p."paymentMethodId",
    pm.name  AS method,
    pm.icon,
    pm.color,
    COUNT(DISTINCT p."orderId")                                                          AS "ordersCount",
    SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END)    AS "finalTotal",
    SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false)
             THEN COALESCE(p."baseAmount", p.amount - COALESCE(p."surchargeAmount",0))
             ELSE 0 END)                                                                 AS "originalTotal",
    SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END)    AS "paidByMethod"
  FROM "Order" o
  JOIN "OrderPayment" p   ON p."orderId" = o.id
  JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
  CROSS JOIN bounds b
  WHERE o."deletedAt" IS NULL
    AND pm."isActive" = true
    AND o."createdAt" >= b.from_ts
    AND o."createdAt" <  b.to_ts
  GROUP BY p."paymentMethodId", pm.name, pm.icon, pm.color
  ORDER BY pm.name;
$$;

-- -----------------------------------------
-- 2) Delivery por método de pago (por fecha de creación de la Orden)
-- -----------------------------------------
CREATE OR REPLACE FUNCTION get_delivery_payments_report_by_date(
  p_from_date DATE DEFAULT CURRENT_DATE,
  p_to_date   DATE DEFAULT CURRENT_DATE
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
      p_from_date::timestamp AS from_ts,
      (p_to_date::timestamp + interval '1 day') AS to_ts
  )
  SELECT
    p."paymentMethodId",
    pm.name  AS method,
    pm.icon,
    pm.color,
    COUNT(DISTINCT o.id)                                                                 AS "deliveryOrdersCount",
    SUM(CASE WHEN COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END)        AS "deliveryFeesPaid",
    SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END)    AS "orderTotalsPaid",
    SUM(p.amount)                                                                        AS "totalPaid"
  FROM "Order" o
  JOIN "Space" s        ON s.id = o."spaceId" AND s.type = 'DELIVERY'
  JOIN "OrderPayment" p ON p."orderId" = o.id
  JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
  CROSS JOIN bounds b
  WHERE o."deletedAt" IS NULL
    AND pm."isActive" = true
    AND o."createdAt" >= b.from_ts
    AND o."createdAt" <  b.to_ts
  GROUP BY p."paymentMethodId", pm.name, pm.icon, pm.color
  ORDER BY pm.name;
$$;

-- -----------------------------------------
-- 3) Órdenes con filtros + paginación (data + total)
--    Tolerante a status='' y spaceType=''
-- -----------------------------------------
CREATE OR REPLACE FUNCTION get_orders_report_by_date(
  p_from_date  DATE    DEFAULT CURRENT_DATE,
  p_to_date    DATE    DEFAULT CURRENT_DATE,
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
  WITH params AS (
    SELECT
      p_from_date::timestamp                         AS from_ts,
      (p_to_date::timestamp + interval '1 day')      AS to_ts,
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
      o."originalTotal",
      o."finalTotal",
      s.code                    AS "spaceCode",
      s.name                    AS "spaceName",
      s.type                    AS "spaceType"
    FROM "Order" o
    JOIN "Space" s ON s.id = o."spaceId"
    CROSS JOIN params p
    WHERE o."deletedAt" IS NULL
      AND o."createdAt" >= p.from_ts
      AND o."createdAt" <  p.to_ts
      AND (p.status_f IS NULL OR o.status = p.status_f)
      AND (p.type_f   IS NULL OR s.type   = p.type_f)
  ),
  total_cte AS (
    SELECT COUNT(*) AS total FROM base
  ),
  page AS (
    SELECT *
    FROM base, params p
    ORDER BY "createdAt" DESC
    LIMIT p.lim_n
    OFFSET (p.page_n - 1) * p.lim_n
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
        'originalTotalCalc', (op.subtotal + op.tax - op.discount),
        'originalTotal',     COALESCE(op."originalTotal", (op.subtotal + op.tax - op.discount)),
        'finalTotal',        COALESCE(op."finalTotal", op."originalTotal", (op.subtotal + op.tax - op.discount)),
        'paidTotal',         pay."paidTotal",
        'deliveryFeeTotal',  pay."deliveryFeeTotal",
        'totalPaid',         pay."totalPaid",
        'payments',          pay.payments
      ) AS row_obj
    FROM page op
    LEFT JOIN LATERAL (
      SELECT
        COALESCE(SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount END),0) AS "paidTotal",
        COALESCE(SUM(CASE WHEN COALESCE(p."isDeliveryService",false) THEN p.amount END),0)     AS "deliveryFeeTotal",
        COALESCE(SUM(p.amount),0)                                                              AS "totalPaid",
        COALESCE(
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'method',     pm.name,
              'amount',     p.amount,
              'isDelivery', COALESCE(p."isDeliveryService",false),
              'paymentDate',p."paymentDate"
            )
            ORDER BY p."paymentDate"
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::jsonb
        ) AS payments
      FROM "OrderPayment" p
      LEFT JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
      WHERE p."orderId" = op.id
    ) AS pay ON TRUE
  )
  SELECT
    COALESCE(JSONB_AGG(row_obj ORDER BY "createdAt" DESC), '[]'::jsonb) AS orders,
    (SELECT total FROM total_cte)                                        AS total
  FROM rows;
$$;

-- -----------------------------------------
-- 4) Índices recomendados (por si faltan)
-- -----------------------------------------
CREATE INDEX IF NOT EXISTS idx_order_created_at       ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS idx_order_spaceid          ON "Order"("spaceId");
CREATE INDEX IF NOT EXISTS idx_space_type             ON "Space"(type);
CREATE INDEX IF NOT EXISTS idx_orderpayment_order     ON "OrderPayment"("orderId");
CREATE INDEX IF NOT EXISTS idx_paymentmethod_isactive ON "PaymentMethod"("isActive");






