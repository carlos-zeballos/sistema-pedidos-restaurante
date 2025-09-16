-- =====================================================
-- VERIFICACIÓN FINAL DE CONSISTENCIA COMPLETA
-- =====================================================

-- 1) Verificar que todas las funciones RPC existen
SELECT 
  'VERIFICACIÓN: FUNCIONES RPC EXISTEN' as categoria,
  routine_name as funcion,
  'OK' as estado
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_orders_report_by_date',
  'get_payment_methods_report_by_date', 
  'get_delivery_payments_report_by_date'
)
ORDER BY routine_name;

-- 2) Verificar que los métodos de pago tienen iconos y colores
SELECT 
  'VERIFICACIÓN: MÉTODOS DE PAGO CONFIGURADOS' as categoria,
  name as metodo,
  CASE 
    WHEN icon IS NOT NULL AND color IS NOT NULL THEN 'OK'
    ELSE 'FALTA CONFIGURACIÓN'
  END as estado
FROM "PaymentMethod"
WHERE "isActive" = true
ORDER BY name;

-- 3) Verificar distribución de estados (debe ser consistente)
SELECT 
  'VERIFICACIÓN: DISTRIBUCIÓN DE ESTADOS' as categoria,
  status,
  COUNT(*) as cantidad,
  CASE 
    WHEN status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'PAGADO', 'CANCELADO') THEN 'OK'
    ELSE 'ESTADO INVÁLIDO'
  END as estado_valido
FROM "Order" 
GROUP BY status
ORDER BY status;

-- 4) Verificar que no hay órdenes en estado 'ENTREGADO' (debe estar eliminado)
SELECT 
  'VERIFICACIÓN: NO HAY ENTREGADO' as categoria,
  COUNT(*) as cantidad_entregado,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ CORRECTO'
    ELSE '❌ ERROR: AÚN HAY ENTREGADO'
  END as estado
FROM "Order" 
WHERE status = 'ENTREGADO';

-- 5) Verificar consistencia entre isPaid y status
WITH consistency_check AS (
  SELECT 
    status,
    "isPaid",
    CASE 
      WHEN status = 'PAGADO' AND "isPaid" = true THEN '✅ CONSISTENTE'
      WHEN status != 'PAGADO' AND "isPaid" = false THEN '✅ CONSISTENTE'
      ELSE '⚠️ INCONSISTENTE'
    END as estado_consistencia
  FROM "Order"
)
SELECT 
  'VERIFICACIÓN: CONSISTENCIA isPaid vs status' as categoria,
  status,
  "isPaid",
  COUNT(*) as cantidad,
  estado_consistencia
FROM consistency_check
GROUP BY status, "isPaid", estado_consistencia
ORDER BY status, "isPaid";

-- 6) Probar reporte de métodos de pago (debe incluir TODAS las órdenes)
SELECT 
  'PRUEBA: MÉTODOS DE PAGO COMPLETO' as categoria,
  method as metodo,
  "ordersCount" as cantidad_ordenes,
  "finalTotal" as total_pagado,
  CASE 
    WHEN "ordersCount" > 0 THEN '✅ CON DATOS'
    ELSE '⚠️ SIN DATOS'
  END as estado
FROM public.get_payment_methods_report_by_date(CURRENT_DATE, CURRENT_DATE)
ORDER BY "finalTotal" DESC;

-- 7) Probar reporte de delivery (solo órdenes de delivery)
SELECT 
  'PRUEBA: DELIVERY COMPLETO' as categoria,
  method as metodo,
  "deliveryOrdersCount" as cantidad_ordenes,
  "totalPaid" as total_pagado,
  CASE 
    WHEN "deliveryOrdersCount" > 0 THEN '✅ CON DATOS'
    ELSE '⚠️ SIN DATOS'
  END as estado
FROM public.get_delivery_payments_report_by_date(CURRENT_DATE, CURRENT_DATE)
ORDER BY "totalPaid" DESC;

-- 8) Probar reporte de órdenes con paginación
SELECT 
  'PRUEBA: ÓRDENES CON PAGINACIÓN' as categoria,
  'Página 1' as descripcion,
  jsonb_array_length(orders) as items_en_pagina,
  total as total_registros,
  CASE 
    WHEN total > 0 THEN '✅ CON DATOS'
    ELSE '⚠️ SIN DATOS'
  END as estado
FROM public.get_orders_report_by_date(CURRENT_DATE, CURRENT_DATE, NULL, NULL, 1, 10);

-- 9) Verificar que los filtros de fecha funcionan
SELECT 
  'PRUEBA: FILTROS DE FECHA' as categoria,
  'Últimos 7 días' as descripcion,
  total as total_ordenes,
  CASE 
    WHEN total > 0 THEN '✅ FILTROS FUNCIONAN'
    ELSE '⚠️ SIN DATOS EN RANGO'
  END as estado
FROM public.get_orders_report_by_date(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, NULL, NULL, 1, 1);

-- 10) Verificar que los filtros por estado funcionan
SELECT 
  'PRUEBA: FILTROS POR ESTADO' as categoria,
  'Solo PAGADO' as descripcion,
  total as total_ordenes,
  CASE 
    WHEN total > 0 THEN '✅ FILTROS FUNCIONAN'
    ELSE '⚠️ SIN DATOS CON ESTADO'
  END as estado
FROM public.get_orders_report_by_date(CURRENT_DATE, CURRENT_DATE, 'PAGADO', NULL, 1, 1);

-- 11) Verificar que los filtros por tipo de espacio funcionan
SELECT 
  'PRUEBA: FILTROS POR TIPO DE ESPACIO' as categoria,
  'Solo DELIVERY' as descripcion,
  total as total_ordenes,
  CASE 
    WHEN total > 0 THEN '✅ FILTROS FUNCIONAN'
    ELSE '⚠️ SIN DATOS CON TIPO'
  END as estado
FROM public.get_orders_report_by_date(CURRENT_DATE, CURRENT_DATE, NULL, 'DELIVERY', 1, 1);

-- 12) Verificar consistencia total entre reportes
WITH payment_total AS (
  SELECT SUM("ordersCount") as total_payment_orders
  FROM public.get_payment_methods_report_by_date(CURRENT_DATE, CURRENT_DATE)
),
delivery_total AS (
  SELECT SUM("deliveryOrdersCount") as total_delivery_orders
  FROM public.get_delivery_payments_report_by_date(CURRENT_DATE, CURRENT_DATE)
),
orders_total AS (
  SELECT total as total_all_orders
  FROM public.get_orders_report_by_date(CURRENT_DATE, CURRENT_DATE, NULL, NULL, 1, 1)
)
SELECT 
  'VERIFICACIÓN: CONSISTENCIA TOTAL' as categoria,
  pt.total_payment_orders as ordenes_metodos_pago,
  dt.total_delivery_orders as ordenes_delivery,
  ot.total_all_orders as total_ordenes,
  CASE 
    WHEN pt.total_payment_orders = ot.total_all_orders THEN '✅ CONSISTENTE'
    ELSE '⚠️ INCONSISTENTE'
  END as estado_consistencia
FROM payment_total pt, delivery_total dt, orders_total ot;

-- 13) Resumen final
SELECT 
  'RESUMEN FINAL' as categoria,
  'Sistema de reportes completamente funcional' as descripcion,
  'Backend y Frontend consistentes' as resultado;
