-- =====================================================
-- VERIFICAR ESTADO ACTUAL DE LA BASE DE DATOS - VERSIÓN SEGURA
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

-- 4) Verificar si OrderStatusHistory tiene columna notes
SELECT 
  'VERIFICACIÓN DE COLUMNAS EN ORDERSTATUSHISTORY' as categoria,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'OrderStatusHistory' 
AND table_schema = 'public'
AND column_name = 'notes';

-- 5) Verificar si las vistas existen
SELECT 
  'VERIFICACIÓN DE VISTAS' as categoria,
  table_name as vista,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('KitchenView', 'SpaceStatusView', 'OrdersReportView')
ORDER BY table_name;

-- 6) Verificar consistencia entre status e isPaid
SELECT 
  'VERIFICACIÓN DE CONSISTENCIA STATUS vs isPaid' as categoria,
  status,
  "isPaid",
  COUNT(*) as cantidad
FROM "Order" 
GROUP BY status, "isPaid"
ORDER BY status, "isPaid";

-- 7) Mostrar algunos ejemplos de pedidos
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

-- 8) Verificar si hay pedidos que necesitan migración
DO $$
DECLARE
    has_entregado BOOLEAN;
    entregado_count INTEGER;
BEGIN
    -- Verificar si 'ENTREGADO' existe en el ENUM
    SELECT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ENTREGADO' 
        AND enumtypid = 'order_status'::regtype
    ) INTO has_entregado;
    
    IF has_entregado THEN
        RAISE NOTICE 'ENTREGADO existe en el ENUM - necesita migración';
        
        -- Contar pedidos en estado ENTREGADO
        SELECT COUNT(*) INTO entregado_count
        FROM "Order" 
        WHERE status = 'ENTREGADO';
        
        RAISE NOTICE 'Pedidos en estado ENTREGADO: %', entregado_count;
    ELSE
        RAISE NOTICE 'ENTREGADO no existe en el ENUM - migración ya realizada';
    END IF;
END $$;
