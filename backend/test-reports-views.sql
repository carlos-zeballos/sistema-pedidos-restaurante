-- =====================================================
-- SCRIPT DE PRUEBA PARA VERIFICAR VISTAS DE REPORTES
-- =====================================================

-- 1. Verificar que las vistas existen
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE viewname IN ('PaymentSummaryView', 'DeliveryPaymentSummaryView', 'OrdersReportView')
ORDER BY viewname;

-- 2. Verificar estructura de PaymentMethod
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'PaymentMethod' 
ORDER BY ordinal_position;

-- 3. Verificar estructura de OrderPayment
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'OrderPayment' 
ORDER BY ordinal_position;

-- 4. Verificar métodos de pago insertados
SELECT 
  id,
  name,
  description,
  icon,
  color,
  "isActive"
FROM "PaymentMethod"
ORDER BY name;

-- 5. Verificar campos agregados a Order
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'Order' 
  AND column_name IN ('originalTotal', 'finalTotal', 'deletedAt', 'deliveryCost', 'isDelivery')
ORDER BY column_name;

-- 6. Probar vista PaymentSummaryView (debería funcionar incluso sin datos)
SELECT * FROM "PaymentSummaryView" LIMIT 5;

-- 7. Probar vista DeliveryPaymentSummaryView
SELECT * FROM "DeliveryPaymentSummaryView" LIMIT 5;

-- 8. Probar vista OrdersReportView
SELECT * FROM "OrdersReportView" LIMIT 5;

-- 9. Verificar triggers existentes
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%order%' OR trigger_name LIKE '%payment%'
ORDER BY trigger_name;

-- 10. Verificar funciones existentes
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('calculate_order_totals', 'recalc_order_final_total', 'soft_delete_order')
ORDER BY routine_name;

-- =====================================================
-- ¡PRUEBAS COMPLETADAS!
-- =====================================================




