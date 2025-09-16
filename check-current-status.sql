-- =====================================================
-- VERIFICAR ESTADO ACTUAL DE LA BASE DE DATOS
-- =====================================================

-- 1) Verificar qué valores tiene el ENUM order_status actual
SELECT 
  'VALORES DEL ENUM order_status' as categoria,
  enumlabel as valor,
  enumsortorder as orden
FROM pg_enum 
WHERE enumtypid = 'order_status'::regtype
ORDER BY enumsortorder;

-- 2) Verificar distribución de estados en Order
SELECT 
  'DISTRIBUCIÓN DE ESTADOS EN ORDER' as categoria,
  status,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM "Order" 
GROUP BY status
ORDER BY status;

-- 3) Verificar si OrderItem tiene columna status
SELECT 
  'VERIFICACIÓN DE COLUMNAS EN ORDERITEM' as categoria,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'OrderItem' 
AND table_schema = 'public'
AND column_name = 'status';

-- 4) Verificar distribución de estados en OrderItem (si existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'OrderItem' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'OrderItem tiene columna status - mostrando distribución';
        PERFORM 1; -- Esto ejecutará la consulta siguiente
    ELSE
        RAISE NOTICE 'OrderItem no tiene columna status';
    END IF;
END $$;

-- Mostrar distribución de estados en OrderItem (solo si existe la columna)
SELECT 
  'DISTRIBUCIÓN DE ESTADOS EN ORDERITEM' as categoria,
  status,
  COUNT(*) as cantidad
FROM "OrderItem" 
GROUP BY status
ORDER BY status;

-- 5) Verificar si OrderStatusHistory tiene columna notes
SELECT 
  'VERIFICACIÓN DE COLUMNAS EN ORDERSTATUSHISTORY' as categoria,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'OrderStatusHistory' 
AND table_schema = 'public'
AND column_name = 'notes';

-- 6) Verificar si las vistas existen
SELECT 
  'VERIFICACIÓN DE VISTAS' as categoria,
  table_name as vista,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('KitchenView', 'SpaceStatusView', 'OrdersReportView')
ORDER BY table_name;

-- 7) Verificar consistencia entre status e isPaid
SELECT 
  'VERIFICACIÓN DE CONSISTENCIA STATUS vs isPaid' as categoria,
  status,
  "isPaid",
  COUNT(*) as cantidad
FROM "Order" 
GROUP BY status, "isPaid"
ORDER BY status, "isPaid";

-- 8) Mostrar algunos ejemplos de pedidos
SELECT 
  'EJEMPLOS DE PEDIDOS' as categoria,
  "orderNumber",
  status,
  "isPaid",
  "totalAmount",
  "createdAt"
FROM "Order" 
ORDER BY "createdAt" DESC
LIMIT 10;
