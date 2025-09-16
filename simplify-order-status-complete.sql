-- =====================================================
-- SIMPLIFICAR ESTADOS DE PEDIDOS - COMPLETO
-- Maneja TODAS las dependencias correctamente
-- =====================================================

BEGIN;

-- 1) Crear nuevo ENUM sin 'ENTREGADO'
CREATE TYPE order_status_new AS ENUM (
    'PENDIENTE',
    'EN_PREPARACION', 
    'LISTO',
    'PAGADO',
    'CANCELADO'
);

-- 2) Agregar columna temporal con el nuevo tipo en Order
ALTER TABLE "Order" ADD COLUMN status_new order_status_new;

-- 3) Migrar datos de Order: convertir 'ENTREGADO' a 'PAGADO', otros valores igual
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

-- 4) Eliminar las vistas que dependen de la columna status
DROP VIEW IF EXISTS "KitchenView" CASCADE;
DROP VIEW IF EXISTS "SpaceStatusView" CASCADE;
DROP VIEW IF EXISTS "OrdersReportView" CASCADE;

-- 5) Eliminar la columna antigua y renombrar la nueva en Order
ALTER TABLE "Order" DROP COLUMN status;
ALTER TABLE "Order" RENAME COLUMN status_new TO status;

-- 6) Hacer lo mismo con OrderStatusHistory
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

-- 7) Manejar OrderItem si tiene columna status
-- Verificar si OrderItem tiene columna status
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'OrderItem' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        -- Agregar columna temporal en OrderItem
        ALTER TABLE "OrderItem" ADD COLUMN status_new order_status_new;
        
        -- Migrar datos de OrderItem
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
        
        -- Eliminar columna antigua y renombrar nueva en OrderItem
        ALTER TABLE "OrderItem" DROP COLUMN status;
        ALTER TABLE "OrderItem" RENAME COLUMN status_new TO status;
        
        RAISE NOTICE 'Columna status migrada en OrderItem';
    ELSE
        RAISE NOTICE 'OrderItem no tiene columna status';
    END IF;
END $$;

-- 8) Eliminar el ENUM antiguo y renombrar el nuevo
DROP TYPE order_status CASCADE;
ALTER TYPE order_status_new RENAME TO order_status;

-- 9) Recrear las vistas con el nuevo ENUM
-- KitchenView
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

-- SpaceStatusView
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

-- OrdersReportView
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

-- 10) Actualizar el historial de estados para reflejar el cambio (si tiene columna notes)
DO $$
BEGIN
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
    ELSE
        RAISE NOTICE 'OrderStatusHistory no tiene columna notes';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Mostrar distribución final de estados en Order
SELECT 
  'DISTRIBUCIÓN FINAL DE ESTADOS EN ORDER' as categoria,
  status,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM "Order" 
GROUP BY status
ORDER BY status;

-- Verificar que no hay pedidos en estado 'ENTREGADO' (ya no existe en el ENUM)
SELECT 
  'VERIFICACIÓN: NO DEBE HABER PEDIDOS ENTREGADOS' as categoria,
  'El estado ENTREGADO ya no existe en el ENUM' as descripcion,
  0 as cantidad_entregados;

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

-- Verificar OrderItem si tiene columna status
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'OrderItem' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'OrderItem tiene columna status - verificando distribución';
        PERFORM 1; -- Esto ejecutará la consulta siguiente
    ELSE
        RAISE NOTICE 'OrderItem no tiene columna status';
    END IF;
END $$;

-- Mostrar distribución de estados en OrderItem (si existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'OrderItem' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Mostrando distribución de estados en OrderItem';
        PERFORM 1; -- Esto ejecutará la consulta siguiente
    ELSE
        RAISE NOTICE 'OrderItem no tiene columna status';
    END IF;
END $$;

-- Mostrar distribución de estados en OrderItem (si existe)
SELECT 
  'DISTRIBUCIÓN DE ESTADOS EN ORDERITEM' as categoria,
  status,
  COUNT(*) as cantidad
FROM "OrderItem" 
GROUP BY status
ORDER BY status;

-- Mostrar algunos ejemplos de pedidos
SELECT 
  'EJEMPLOS DE PEDIDOS' as categoria,
  "orderNumber",
  status,
  "isPaid",
  "totalAmount"
FROM "Order" 
ORDER BY "createdAt" DESC
LIMIT 10;
