-- =====================================================
-- SCRIPT DE LIMPIEZA DE ÓRDENES ANTIGUAS
-- =====================================================
-- Este script limpia órdenes de días anteriores que no fueron marcadas como PAGADO o CANCELADO
-- para evitar confusión en el sistema de cocina

BEGIN;

-- 1. Marcar como CANCELADO todas las órdenes de días anteriores que no están PAGADAS
UPDATE "Order" 
SET 
  status = 'CANCELADO',
  "updatedAt" = NOW()
WHERE 
  status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO')
  AND DATE("createdAt") < CURRENT_DATE;

-- 2. Liberar todos los espacios que tenían órdenes canceladas
UPDATE "Space" 
SET 
  status = 'LIBRE',
  "updatedAt" = NOW()
WHERE 
  id IN (
    SELECT DISTINCT "spaceId" 
    FROM "Order" 
    WHERE status = 'CANCELADO' 
    AND DATE("createdAt") < CURRENT_DATE
  );

-- 3. Crear entradas en el historial para las órdenes canceladas
INSERT INTO "OrderStatusHistory" ("orderId", "status", "changedBy", "notes", "createdAt")
SELECT 
  o.id,
  'CANCELADO',
  o."createdBy",
  'Cancelado automáticamente - orden de día anterior',
  NOW()
FROM "Order" o
WHERE 
  o.status = 'CANCELADO'
  AND DATE(o."createdAt") < CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM "OrderStatusHistory" osh 
    WHERE osh."orderId" = o.id 
    AND osh."status" = 'CANCELADO'
  );

-- 4. Mostrar resumen de la limpieza
SELECT 
  'Órdenes canceladas' as accion,
  COUNT(*) as cantidad
FROM "Order" 
WHERE status = 'CANCELADO' 
AND DATE("createdAt") < CURRENT_DATE

UNION ALL

SELECT 
  'Espacios liberados' as accion,
  COUNT(*) as cantidad
FROM "Space" 
WHERE status = 'LIBRE'
AND "updatedAt" >= NOW() - INTERVAL '1 minute';

COMMIT;

-- Mensaje de confirmación
SELECT 'Limpieza de órdenes antiguas completada exitosamente' as resultado;





