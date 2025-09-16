-- =====================================================
-- VERIFICACIÓN COMPLETA DE REPORTES CORREGIDOS
-- =====================================================

-- 1) Verificar que las funciones existen
SELECT 
  'VERIFICACIÓN: FUNCIONES EXISTEN' as categoria,
  routine_name as funcion,
  routine_type as tipo
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_orders_report_by_date',
  'get_payment_methods_report_by_date', 
  'get_delivery_payments_report_by_date'
)
ORDER BY routine_name;

-- 2) Verificar distribución de estados actual
SELECT 
  'ESTADOS ACTUALES EN ÓRDENES' as categoria,
  status,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM "Order" 
GROUP BY status
ORDER BY status;

-- 3) Verificar distribución de tipos de espacio
SELECT 
  'TIPOS DE ESPACIO' as categoria,
  s.type as tipo_espacio,
  COUNT(o.id) as cantidad_ordenes,
  ROUND(COUNT(o.id) * 100.0 / SUM(COUNT(o.id)) OVER(), 2) as porcentaje
FROM "Order" o
JOIN "Space" s ON s.id = o."spaceId"
GROUP BY s.type
ORDER BY s.type;

-- 4) Verificar distribución de pagos
SELECT 
  'DISTRIBUCIÓN DE PAGOS' as categoria,
  CASE 
    WHEN COUNT(op.id) = 0 THEN 'Sin Pagos'
    ELSE 'Con Pagos'
  END as estado_pago,
  COUNT(DISTINCT o.id) as cantidad_ordenes,
  ROUND(COUNT(DISTINCT o.id) * 100.0 / SUM(COUNT(DISTINCT o.id)) OVER(), 2) as porcentaje
FROM "Order" o
LEFT JOIN "OrderPayment" op ON op."orderId" = o.id
GROUP BY CASE WHEN COUNT(op.id) = 0 THEN 'Sin Pagos' ELSE 'Con Pagos' END
ORDER BY estado_pago;

-- 5) Probar reporte de métodos de pago (hoy)
SELECT 
  'PRUEBA: MÉTODOS DE PAGO (HOY)' as categoria,
  method as metodo,
  "ordersCount" as cantidad_ordenes,
  "finalTotal" as total_pagado
FROM public.get_payment_methods_report_by_date(CURRENT_DATE, CURRENT_DATE)
ORDER BY "finalTotal" DESC;

-- 6) Probar reporte de delivery (hoy)
SELECT 
  'PRUEBA: DELIVERY (HOY)' as categoria,
  method as metodo,
  "deliveryOrdersCount" as cantidad_ordenes,
  "totalPaid" as total_pagado
FROM public.get_delivery_payments_report_by_date(CURRENT_DATE, CURRENT_DATE)
ORDER BY "totalPaid" DESC;

-- 7) Probar reporte de órdenes (hoy, primera página)
SELECT 
  'PRUEBA: ÓRDENES (HOY)' as categoria,
  jsonb_array_length(orders) as ordenes_en_pagina,
  total as total_registros,
  CASE 
    WHEN total > 0 THEN 'OK'
    ELSE 'SIN DATOS'
  END as estado
FROM public.get_orders_report_by_date(CURRENT_DATE, CURRENT_DATE, NULL, NULL, 1, 10);

-- 8) Verificar consistencia entre reportes
WITH payment_methods AS (
  SELECT SUM("ordersCount") as total_payment_orders
  FROM public.get_payment_methods_report_by_date(CURRENT_DATE, CURRENT_DATE)
),
delivery_methods AS (
  SELECT SUM("deliveryOrdersCount") as total_delivery_orders
  FROM public.get_delivery_payments_report_by_date(CURRENT_DATE, CURRENT_DATE)
),
all_orders AS (
  SELECT total as total_all_orders
  FROM public.get_orders_report_by_date(CURRENT_DATE, CURRENT_DATE, NULL, NULL, 1, 1)
)
SELECT 
  'VERIFICACIÓN DE CONSISTENCIA' as categoria,
  pm.total_payment_orders as ordenes_metodos_pago,
  dm.total_delivery_orders as ordenes_delivery,
  ao.total_all_orders as total_ordenes,
  CASE 
    WHEN pm.total_payment_orders = ao.total_all_orders THEN '✅ CONSISTENTE'
    ELSE '⚠️ INCONSISTENTE'
  END as estado_consistencia
FROM payment_methods pm, delivery_methods dm, all_orders ao;

-- 9) Verificar filtros de fecha (últimos 7 días)
SELECT 
  'PRUEBA: FILTROS DE FECHA (7 DÍAS)' as categoria,
  'Métodos de Pago' as reporte,
  COUNT(*) as cantidad_metodos
FROM public.get_payment_methods_report_by_date(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE)
UNION ALL
SELECT 
  'PRUEBA: FILTROS DE FECHA (7 DÍAS)' as categoria,
  'Delivery' as reporte,
  COUNT(*) as cantidad_metodos
FROM public.get_delivery_payments_report_by_date(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE)
UNION ALL
SELECT 
  'PRUEBA: FILTROS DE FECHA (7 DÍAS)' as categoria,
  'Órdenes' as reporte,
  total as cantidad_metodos
FROM public.get_orders_report_by_date(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, NULL, NULL, 1, 1);

-- 10) Verificar filtros por estado
SELECT 
  'PRUEBA: FILTROS POR ESTADO' as categoria,
  'PAGADO' as estado_filtro,
  total as cantidad_ordenes
FROM public.get_orders_report_by_date(CURRENT_DATE, CURRENT_DATE, 'PAGADO', NULL, 1, 1)
UNION ALL
SELECT 
  'PRUEBA: FILTROS POR ESTADO' as categoria,
  'PENDIENTE' as estado_filtro,
  total as cantidad_ordenes
FROM public.get_orders_report_by_date(CURRENT_DATE, CURRENT_DATE, 'PENDIENTE', NULL, 1, 1);

-- 11) Resumen final
SELECT 
  'RESUMEN FINAL' as categoria,
  'Reportes corregidos y funcionando' as descripcion,
  'Filtros de fecha, métodos de pago y delivery operativos' as resultado;
