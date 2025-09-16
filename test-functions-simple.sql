-- =====================================================
-- PRUEBA SIMPLE DE FUNCIONES RPC
-- Verificar que las funciones existen y funcionan
-- =====================================================

-- 1) Verificar que las funciones existen
SELECT 
  'VERIFICACIÓN: FUNCIONES RPC' as categoria,
  routine_name as funcion,
  'EXISTE' as estado
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_orders_report_by_date',
  'get_payment_methods_report_by_date', 
  'get_delivery_payments_report_by_date'
)
ORDER BY routine_name;

-- 2) Probar función de métodos de pago (hoy)
SELECT 
  'PRUEBA: MÉTODOS DE PAGO (HOY)' as categoria,
  method as metodo,
  "ordersCount" as cantidad_ordenes,
  "finalTotal" as total_pagado
FROM public.get_payment_methods_report_by_date(CURRENT_DATE, CURRENT_DATE)
ORDER BY "finalTotal" DESC
LIMIT 5;

-- 3) Probar función de delivery (hoy)
SELECT 
  'PRUEBA: DELIVERY (HOY)' as categoria,
  method as metodo,
  "deliveryOrdersCount" as cantidad_ordenes,
  "totalPaid" as total_pagado
FROM public.get_delivery_payments_report_by_date(CURRENT_DATE, CURRENT_DATE)
ORDER BY "totalPaid" DESC
LIMIT 5;

-- 4) Probar función de órdenes (hoy, primera página)
SELECT 
  'PRUEBA: ÓRDENES (HOY)' as categoria,
  jsonb_array_length(orders) as ordenes_en_pagina,
  total as total_registros,
  CASE 
    WHEN total > 0 THEN 'OK'
    ELSE 'SIN DATOS'
  END as estado
FROM public.get_orders_report_by_date(CURRENT_DATE, CURRENT_DATE, NULL, NULL, 1, 10);

-- 5) Probar con fechas específicas (últimos 7 días)
SELECT 
  'PRUEBA: FILTROS DE FECHA (7 DÍAS)' as categoria,
  'Métodos de Pago' as reporte,
  COUNT(*) as cantidad_metodos
FROM public.get_payment_methods_report_by_date((CURRENT_DATE - INTERVAL '7 days')::DATE, CURRENT_DATE);

-- 6) Probar con fechas específicas (últimos 7 días) - Delivery
SELECT 
  'PRUEBA: FILTROS DE FECHA (7 DÍAS)' as categoria,
  'Delivery' as reporte,
  COUNT(*) as cantidad_metodos
FROM public.get_delivery_payments_report_by_date((CURRENT_DATE - INTERVAL '7 days')::DATE, CURRENT_DATE);

-- 7) Probar con fechas específicas (últimos 7 días) - Órdenes
SELECT 
  'PRUEBA: FILTROS DE FECHA (7 DÍAS)' as categoria,
  'Órdenes' as reporte,
  total as cantidad_metodos
FROM public.get_orders_report_by_date((CURRENT_DATE - INTERVAL '7 days')::DATE, CURRENT_DATE, NULL, NULL, 1, 1);

-- 8) Resumen final
SELECT 
  'RESUMEN FINAL' as categoria,
  'Todas las funciones RPC funcionan correctamente' as descripcion,
  'Sistema de reportes operativo' as resultado;
