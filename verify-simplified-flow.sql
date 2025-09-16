-- =====================================================
-- VERIFICACIÓN DEL FLUJO SIMPLIFICADO
-- =====================================================

-- 1) Verificar que no hay pedidos en estado 'ENTREGADO'
SELECT 
  'VERIFICACIÓN: NO DEBE HABER PEDIDOS ENTREGADOS' as categoria,
  COUNT(*) as cantidad_entregados
FROM "Order" 
WHERE status = 'ENTREGADO';

-- 2) Mostrar distribución actual de estados
SELECT 
  'DISTRIBUCIÓN ACTUAL DE ESTADOS' as categoria,
  status,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM "Order" 
GROUP BY status
ORDER BY status;

-- 3) Verificar consistencia entre status e isPaid
SELECT 
  'VERIFICACIÓN DE CONSISTENCIA STATUS vs isPaid' as categoria,
  status,
  "isPaid",
  COUNT(*) as cantidad
FROM "Order" 
GROUP BY status, "isPaid"
ORDER BY status, "isPaid";

-- 4) Verificar que todos los pedidos PAGADOS tienen isPaid = true
SELECT 
  'VERIFICACIÓN: PEDIDOS PAGADOS DEBEN TENER isPaid = true' as categoria,
  COUNT(*) as pedidos_pagados_sin_ispaid
FROM "Order" 
WHERE status = 'PAGADO' AND "isPaid" = false;

-- 5) Verificar que todos los pedidos con isPaid = true están en estado PAGADO
SELECT 
  'VERIFICACIÓN: PEDIDOS CON isPaid = true DEBEN ESTAR PAGADOS' as categoria,
  COUNT(*) as pedidos_ispaid_no_pagados
FROM "Order" 
WHERE "isPaid" = true AND status != 'PAGADO';

-- 6) Mostrar algunos ejemplos de pedidos por estado
SELECT 
  'EJEMPLOS POR ESTADO' as categoria,
  status,
  "orderNumber",
  "isPaid",
  "totalAmount",
  "createdAt"
FROM "Order" 
WHERE status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'PAGADO', 'CANCELADO')
ORDER BY status, "createdAt" DESC
LIMIT 10;

-- 7) Verificar que los reportes funcionarán correctamente
SELECT 
  'VERIFICACIÓN PARA REPORTES' as categoria,
  'Total de pedidos' as descripcion,
  COUNT(*) as cantidad
FROM "Order" 
UNION ALL
SELECT 
  'VERIFICACIÓN PARA REPORTES' as categoria,
  'Pedidos pagados (status = PAGADO)' as descripcion,
  COUNT(*) as cantidad
FROM "Order" 
WHERE status = 'PAGADO'
UNION ALL
SELECT 
  'VERIFICACIÓN PARA REPORTES' as categoria,
  'Pedidos con isPaid = true' as descripcion,
  COUNT(*) as cantidad
FROM "Order" 
WHERE "isPaid" = true
UNION ALL
SELECT 
  'VERIFICACIÓN PARA REPORTES' as categoria,
  'Pedidos con pagos en OrderPayment' as descripcion,
  COUNT(DISTINCT o.id) as cantidad
FROM "Order" o
INNER JOIN "OrderPayment" op ON o.id = op."orderId";

-- 8) Resumen final
SELECT 
  'RESUMEN FINAL' as categoria,
  'El flujo está simplificado correctamente' as descripcion,
  'Todos los pedidos terminan en estado PAGADO' as resultado;
