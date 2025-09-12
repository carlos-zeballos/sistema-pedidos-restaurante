-- =========================================
-- CORRECCIÓN: Error de tipo order_status = text
-- =========================================

BEGIN;

-- Eliminar la función problemática
DROP FUNCTION IF EXISTS get_orders_report_by_date(date,date,text,text,integer,integer);

-- Recrear la función con cast explícito para el status
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
LANGUAGE plpgsql
AS $$
DECLARE
  v_total  BIGINT;
  v_offset INTEGER := GREATEST((p_page - 1) * p_limit, 0);
BEGIN
  -- Total de filas que cumplen los filtros
  SELECT COUNT(*)
  INTO v_total
  FROM "Order" o
  JOIN "Space" s ON s.id = o."spaceId"
  WHERE o."deletedAt" IS NULL
    AND o."createdAt"::date BETWEEN p_from_date AND p_to_date
    AND (p_status IS NULL OR p_status = '' OR o.status::text = p_status)
    AND (p_space_type IS NULL OR p_space_type = '' OR s.type::text = p_space_type);

  -- Devolver la página solicitada como JSONB + el total
  RETURN QUERY
  WITH base AS (
    SELECT o.id
    FROM "Order" o
    JOIN "Space" s ON s.id = o."spaceId"
    WHERE o."deletedAt" IS NULL
      AND o."createdAt"::date BETWEEN p_from_date AND p_to_date
      AND (p_status IS NULL OR p_status = '' OR o.status::text = p_status)
      AND (p_space_type IS NULL OR p_space_type = '' OR s.type::text = p_space_type)
    ORDER BY o."createdAt" DESC
    LIMIT p_limit OFFSET v_offset
  )
  SELECT
    COALESCE(
      (
        SELECT JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'id',                o.id,
            'orderNumber',       o."orderNumber",
            'createdAt',         o."createdAt",
            'spaceCode',         s.code,
            'spaceName',         s.name,
            'spaceType',         s.type,
            'customerName',      o."customerName",
            'status',            o.status,
            'originalTotalCalc', (COALESCE(o.subtotal,0) + COALESCE(o.tax,0) - COALESCE(o.discount,0)),
            'originalTotal',     COALESCE(o."originalTotal", (COALESCE(o.subtotal,0)+COALESCE(o.tax,0)-COALESCE(o.discount,0))),
            'finalTotal',        COALESCE(o."finalTotal", o."originalTotal", (COALESCE(o.subtotal,0)+COALESCE(o.tax,0)-COALESCE(o.discount,0))),
            'paidTotal',         COALESCE((
                                   SELECT SUM(CASE WHEN NOT COALESCE(p2."isDeliveryService",false) THEN p2.amount END)
                                   FROM "OrderPayment" p2 WHERE p2."orderId" = o.id
                                 ),0),
            'deliveryFeeTotal',  COALESCE((
                                   SELECT SUM(CASE WHEN COALESCE(p3."isDeliveryService",false) THEN p3.amount END)
                                   FROM "OrderPayment" p3 WHERE p3."orderId" = o.id
                                 ),0),
            'totalPaid',         COALESCE((
                                   SELECT SUM(p4.amount) FROM "OrderPayment" p4 WHERE p4."orderId" = o.id
                                 ),0),
            'payments',          COALESCE((
                                   SELECT JSONB_AGG(
                                     JSONB_BUILD_OBJECT(
                                       'method',     pm.name,
                                       'amount',     p.amount,
                                       'isDelivery', COALESCE(p."isDeliveryService",false),
                                       'paymentDate',p."paymentDate"
                                     )
                                     ORDER BY p."paymentDate"
                                   )
                                   FROM "OrderPayment" p
                                   LEFT JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
                                   WHERE p."orderId" = o.id
                                 ), '[]'::jsonb)
          )
          ORDER BY o."createdAt" DESC
        )
        FROM base b
        JOIN "Order" o ON o.id = b.id
        JOIN "Space" s ON s.id = o."spaceId"
      ),
      '[]'::jsonb
    ) AS orders,
    v_total AS total;

END;
$$;

COMMIT;




