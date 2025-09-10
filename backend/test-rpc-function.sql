-- =========================================
-- TEST: Verificar función RPC get_orders_report_by_date
-- =========================================

-- 1) Verificar que la función existe
SELECT 
  routine_name, 
  routine_type, 
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_orders_report_by_date';

-- 2) Probar la función con parámetros básicos
SELECT * FROM get_orders_report_by_date(
  '2025-09-10'::date, 
  '2025-09-10'::date, 
  NULL, 
  NULL, 
  1, 
  50
);

-- 3) Verificar que existen órdenes en la fecha
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN "deletedAt" IS NULL THEN 1 END) as active_orders
FROM "Order" 
WHERE "createdAt"::date = '2025-09-10';

-- 4) Verificar tipos de ENUM
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('order_status', 'space_type')
ORDER BY t.typname, e.enumsortorder;

-- 5) Verificar estructura de tablas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('Order', 'Space', 'OrderPayment', 'PaymentMethod')
ORDER BY table_name, ordinal_position;