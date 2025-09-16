-- =====================================================
-- SCRIPT COMPLETO DEL SISTEMA ULTRA-SIMPLIFICADO
-- Incluye: Estados simplificados + Reportes corregidos + Funciones optimizadas
-- =====================================================

BEGIN;

-- =====================================================
-- PARTE 1: SIMPLIFICAR ESTADOS DE PEDIDOS
-- =====================================================

-- Verificar si el ENUM actual tiene 'ENTREGADO'
DO $$
DECLARE
    has_entregado BOOLEAN;
    entregado_count INTEGER;
BEGIN
    -- Verificar si 'ENTREGADO' existe en el ENUM
    SELECT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ENTREGADO' 
        AND enumtypid = 'order_status'::regtype
    ) INTO has_entregado;
    
    IF has_entregado THEN
        RAISE NOTICE 'ENTREGADO existe en el ENUM - procediendo con migración';
        
        -- Contar pedidos en estado ENTREGADO
        SELECT COUNT(*) INTO entregado_count
        FROM "Order" 
        WHERE status = 'ENTREGADO';
        
        RAISE NOTICE 'Pedidos en estado ENTREGADO que serán migrados: %', entregado_count;
        
        -- Crear nuevo ENUM sin 'ENTREGADO'
        CREATE TYPE order_status_new AS ENUM (
            'PENDIENTE',
            'EN_PREPARACION', 
            'LISTO',
            'PAGADO',
            'CANCELADO'
        );
        
        -- Agregar columna temporal en Order
        ALTER TABLE "Order" ADD COLUMN status_new order_status_new;
        
        -- Migrar datos de Order: convertir 'ENTREGADO' a 'PAGADO'
        UPDATE "Order" SET status_new = 
            CASE 
                WHEN status = 'ENTREGADO' THEN 'PAGADO'::order_status_new
                WHEN status = 'PENDIENTE' THEN 'PENDIENTE'::order_status_new
                WHEN status = 'EN_PREPARACION' THEN 'EN_PREPARACION'::order_status_new
                WHEN status = 'LISTO' THEN 'LISTO'::order_status_new
                WHEN status = 'PAGADO' THEN 'PAGADO'::order_status_new
                WHEN status = 'CANCELADO' THEN 'CANCELADO'::order_status_new
                ELSE 'PENDIENTE'::order_status_new
            END;
        
        -- Eliminar vistas que dependen de la columna status
        DROP VIEW IF EXISTS "KitchenView" CASCADE;
        DROP VIEW IF EXISTS "SpaceStatusView" CASCADE;
        DROP VIEW IF EXISTS "OrdersReportView" CASCADE;
        
        -- Eliminar columna antigua y renombrar nueva en Order
        ALTER TABLE "Order" DROP COLUMN status;
        ALTER TABLE "Order" RENAME COLUMN status_new TO status;
        
        -- Hacer lo mismo con OrderStatusHistory
        ALTER TABLE "OrderStatusHistory" ADD COLUMN status_new order_status_new;
        UPDATE "OrderStatusHistory" SET status_new = 
            CASE 
                WHEN status = 'ENTREGADO' THEN 'PAGADO'::order_status_new
                WHEN status = 'PENDIENTE' THEN 'PENDIENTE'::order_status_new
                WHEN status = 'EN_PREPARACION' THEN 'EN_PREPARACION'::order_status_new
                WHEN status = 'LISTO' THEN 'LISTO'::order_status_new
                WHEN status = 'PAGADO' THEN 'PAGADO'::order_status_new
                WHEN status = 'CANCELADO' THEN 'CANCELADO'::order_status_new
                ELSE 'PENDIENTE'::order_status_new
            END;
        ALTER TABLE "OrderStatusHistory" DROP COLUMN status;
        ALTER TABLE "OrderStatusHistory" RENAME COLUMN status_new TO status;
        
        -- Manejar OrderItem si tiene columna status
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'OrderItem' 
            AND column_name = 'status'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE "OrderItem" ADD COLUMN status_new order_status_new;
            UPDATE "OrderItem" SET status_new = 
                CASE 
                    WHEN status = 'ENTREGADO' THEN 'PAGADO'::order_status_new
                    WHEN status = 'PENDIENTE' THEN 'PENDIENTE'::order_status_new
                    WHEN status = 'EN_PREPARACION' THEN 'EN_PREPARACION'::order_status_new
                    WHEN status = 'LISTO' THEN 'LISTO'::order_status_new
                    WHEN status = 'PAGADO' THEN 'PAGADO'::order_status_new
                    WHEN status = 'CANCELADO' THEN 'CANCELADO'::order_status_new
                    ELSE 'PENDIENTE'::order_status_new
                END;
            ALTER TABLE "OrderItem" DROP COLUMN status;
            ALTER TABLE "OrderItem" RENAME COLUMN status_new TO status;
            RAISE NOTICE 'Columna status migrada en OrderItem';
        END IF;
        
        -- Eliminar el ENUM antiguo y renombrar el nuevo
        DROP TYPE order_status CASCADE;
        ALTER TYPE order_status_new RENAME TO order_status;
        
        -- Recrear las vistas con el nuevo ENUM
        CREATE VIEW "KitchenView" AS
        SELECT 
            o.id,
            o."orderNumber",
            o.status,
            o."createdAt",
            o."totalAmount",
            o."customerName",
            o."customerPhone",
            o.notes,
            s.name as space_name,
            u.username as created_by_username
        FROM "Order" o
        LEFT JOIN "Space" s ON o."spaceId" = s.id
        LEFT JOIN "User" u ON o."createdBy" = u.id
        WHERE o.status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO')
        ORDER BY o."createdAt" ASC;
        
        CREATE VIEW "SpaceStatusView" AS
        SELECT 
            s.id,
            s.name,
            s.status as space_status,
            COUNT(o.id) as active_orders,
            COALESCE(SUM(o."totalAmount"), 0) as total_amount
        FROM "Space" s
        LEFT JOIN "Order" o ON s.id = o."spaceId" 
            AND o.status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'PAGADO')
        GROUP BY s.id, s.name, s.status
        ORDER BY s.name;
        
        CREATE VIEW "OrdersReportView" AS
        SELECT 
            o.id,
            o."orderNumber",
            o.status,
            o."totalAmount",
            o."isPaid",
            o."createdAt",
            o."customerName",
            o."customerPhone",
            s.name as space_name,
            u.username as created_by_username,
            CASE 
                WHEN o.status = 'PAGADO' THEN 'Completado'
                WHEN o.status = 'CANCELADO' THEN 'Cancelado'
                ELSE 'En Proceso'
            END as status_display
        FROM "Order" o
        LEFT JOIN "Space" s ON o."spaceId" = s.id
        LEFT JOIN "User" u ON o."createdBy" = u.id
        ORDER BY o."createdAt" DESC;
        
        -- Actualizar historial si tiene columna notes
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'OrderStatusHistory' 
            AND column_name = 'notes'
            AND table_schema = 'public'
        ) THEN
            UPDATE "OrderStatusHistory" 
            SET notes = 'Estado actualizado: ENTREGADO → PAGADO (simplificación)'
            WHERE status = 'PAGADO' AND notes LIKE '%ENTREGADO%';
            RAISE NOTICE 'Historial de estados actualizado';
        END IF;
        
        RAISE NOTICE 'Migración completada exitosamente';
        
    ELSE
        RAISE NOTICE 'ENTREGADO no existe en el ENUM - migración ya realizada';
    END IF;
END $$;

-- =====================================================
-- PARTE 2: FUNCIONES RPC OPTIMIZADAS PARA VISTA DE MOZOS
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
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SUBSTRING("orderNumber" FROM 14) AS INTEGER)), 0) + 1 
     FROM "Order" 
     WHERE "orderNumber" LIKE 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%'), 
    4, '0'
  );

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT price INTO v_product_price 
    FROM "Product" 
    WHERE id = (v_item->>'productId')::UUID;
    
    v_total_amount := v_total_amount + (v_product_price * (v_item->>'quantity')::INTEGER);
  END LOOP;

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

-- =====================================================
-- PARTE 3: CORREGIR FUNCIONES DE REPORTES
-- =====================================================

-- Eliminar funciones anteriores
DROP FUNCTION IF EXISTS public.get_orders_report_by_date(DATE, DATE, TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.get_payment_methods_report_by_date(DATE, DATE);
DROP FUNCTION IF EXISTS public.get_delivery_payments_report_by_date(DATE, DATE);

-- Función de reporte de órdenes corregida
CREATE OR REPLACE FUNCTION public.get_orders_report_by_date(
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
  WITH bounds AS (
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
        COALESCE(
          (
            SELECT SUM(p.amount)
            FROM "OrderPayment" p
            WHERE p."orderId" = op.id
            AND COALESCE(p."isDeliveryService", false) = true
          ),
          0
        ) AS "deliveryFeeTotal",
        COALESCE(
          (
            SELECT SUM(p.amount)
            FROM "OrderPayment" p
            WHERE p."orderId" = op.id
          ),
          0
        ) AS "totalPaid",
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

-- Función de reporte de métodos de pago corregida
CREATE OR REPLACE FUNCTION public.get_payment_methods_report_by_date(
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
  ),
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

-- Función de reporte de delivery corregida
CREATE OR REPLACE FUNCTION public.get_delivery_payments_report_by_date(
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
  ),
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
-- PARTE 4: ÍNDICES OPTIMIZADOS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_order_status_created_at ON "Order" (status, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_order_space_status ON "Order" ("spaceId", status);
CREATE INDEX IF NOT EXISTS idx_orderitem_order_id ON "OrderItem" ("orderId");
CREATE INDEX IF NOT EXISTS idx_product_available ON "Product" ("isAvailable") WHERE "isAvailable" = true;
CREATE INDEX IF NOT EXISTS idx_space_active ON "Space" ("isActive") WHERE "isActive" = true;

-- =====================================================
-- PARTE 5: PERMISOS
-- =====================================================

-- Permisos para las funciones de reportes
REVOKE ALL ON FUNCTION public.get_orders_report_by_date(DATE, DATE, TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_orders_report_by_date(DATE, DATE, TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_payment_methods_report_by_date(DATE, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_payment_methods_report_by_date(DATE, DATE) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_delivery_payments_report_by_date(DATE, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_delivery_payments_report_by_date(DATE, DATE) TO anon, authenticated;

-- Permisos para las funciones de mozos
GRANT EXECUTE ON FUNCTION get_active_orders_for_waiters() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_simple_order(UUID, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_waiters_dashboard_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_space_available(UUID) TO anon, authenticated;

COMMIT;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar distribución final de estados
SELECT 
  'DISTRIBUCIÓN FINAL DE ESTADOS' as categoria,
  status,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM "Order" 
GROUP BY status
ORDER BY status;

-- Verificar que las vistas funcionan
SELECT 
  'VERIFICACIÓN: VISTAS RECREADAS' as categoria,
  'KitchenView' as vista,
  COUNT(*) as registros
FROM "KitchenView"
UNION ALL
SELECT 
  'VERIFICACIÓN: VISTAS RECREADAS' as categoria,
  'SpaceStatusView' as vista,
  COUNT(*) as registros
FROM "SpaceStatusView"
UNION ALL
SELECT 
  'VERIFICACIÓN: VISTAS RECREADAS' as categoria,
  'OrdersReportView' as vista,
  COUNT(*) as registros
FROM "OrdersReportView";

-- Probar funciones de mozos
SELECT 
  'PRUEBA: FUNCIONES DE MOZOS' as categoria,
  'get_active_orders_for_waiters' as funcion,
  COUNT(*) as registros
FROM get_active_orders_for_waiters();

-- Probar funciones de reportes
SELECT 
  'PRUEBA: REPORTE MÉTODOS DE PAGO' as categoria,
  method,
  "ordersCount",
  "finalTotal"
FROM public.get_payment_methods_report_by_date(CURRENT_DATE, CURRENT_DATE)
LIMIT 3;

-- Mensaje final
SELECT 
  'RESUMEN FINAL' as categoria,
  'Sistema ultra-simplificado completamente configurado' as descripcion,
  'Estados simplificados + Reportes corregidos + Funciones optimizadas' as resultado;
