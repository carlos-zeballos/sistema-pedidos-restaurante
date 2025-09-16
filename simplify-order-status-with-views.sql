-- =====================================================
-- SIMPLIFICAR ESTADOS DE PEDIDOS - CON VISTAS
-- Maneja las dependencias de vistas correctamente
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

-- 2) Agregar columna temporal con el nuevo tipo
ALTER TABLE "Order" ADD COLUMN status_new order_status_new;

-- 3) Migrar datos: convertir 'ENTREGADO' a 'PAGADO', otros valores igual
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

-- 5) Eliminar la columna antigua y renombrar la nueva
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

-- 7) Eliminar el ENUM antiguo y renombrar el nuevo
DROP TYPE order_status;
ALTER TYPE order_status_new RENAME TO order_status;

-- 8) Recrear las vistas con el nuevo ENUM
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

-- 9) Actualizar el historial de estados para reflejar el cambio
UPDATE "OrderStatusHistory" 
SET notes = 'Estado actualizado: ENTREGADO → PAGADO (simplificación)',
    "updatedAt" = NOW()
WHERE status = 'PAGADO' AND notes LIKE '%ENTREGADO%';

COMMIT;

-- =====================================================
-- VERIFICACIÓN
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

-- Verificar que no hay pedidos en estado 'ENTREGADO'
SELECT 
  'VERIFICACIÓN: NO DEBE HABER PEDIDOS ENTREGADOS' as categoria,
  COUNT(*) as cantidad_entregados
FROM "Order" 
WHERE status = 'ENTREGADO';

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
