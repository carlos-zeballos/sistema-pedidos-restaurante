-- =====================================================
-- SIMPLIFICAR ESTADOS DE PEDIDOS - ELIMINAR "ENTREGADO"
-- =====================================================

BEGIN;

-- 1) Crear nuevo ENUM sin 'ENTREGADO'
-- Nota: PostgreSQL no permite eliminar valores de ENUM, así que creamos uno nuevo
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

-- 4) Eliminar la columna antigua y renombrar la nueva
ALTER TABLE "Order" DROP COLUMN status;
ALTER TABLE "Order" RENAME COLUMN status_new TO status;

-- 5) Hacer lo mismo con OrderStatusHistory
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

-- 6) Eliminar el ENUM antiguo y renombrar el nuevo
DROP TYPE order_status;
ALTER TYPE order_status_new RENAME TO order_status;

-- 7) Actualizar el historial de estados para reflejar el cambio
UPDATE "OrderStatusHistory" 
SET notes = 'Estado actualizado: ENTREGADO → PAGADO (simplificación)',
    "updatedAt" = NOW()
WHERE status = 'PAGADO' AND notes LIKE '%ENTREGADO%';

-- 8) Verificar el cambio
SELECT 
  'ESTADOS ACTUALES' as categoria,
  status,
  COUNT(*) as cantidad
FROM "Order" 
GROUP BY status
ORDER BY status;

-- 9) Mostrar resumen de cambios
SELECT 
  'RESUMEN DE CAMBIOS' as categoria,
  'Pedidos actualizados de ENTREGADO a PAGADO' as descripcion,
  COUNT(*) as cantidad
FROM "Order" 
WHERE "updatedAt" > NOW() - INTERVAL '1 minute';

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

-- Mostrar algunos ejemplos de pedidos actualizados
SELECT 
  'EJEMPLOS DE PEDIDOS ACTUALIZADOS' as categoria,
  "orderNumber",
  status,
  "isPaid",
  "totalAmount",
  "updatedAt"
FROM "Order" 
WHERE "updatedAt" > NOW() - INTERVAL '1 minute'
ORDER BY "updatedAt" DESC
LIMIT 5;
