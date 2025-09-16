-- =====================================================
-- VERIFICACIÓN DE FUNCIONES DE TRIGGERS
-- =====================================================

-- 1. Verificar qué funciones existen
SELECT 'Funciones relacionadas con order number:' as info;
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name LIKE '%order%number%' 
   OR routine_name LIKE '%fill%order%'
ORDER BY routine_name;

-- 2. Verificar la estructura de la tabla Order
SELECT 'Columnas de la tabla Order:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Order' 
ORDER BY ordinal_position;

-- 3. Verificar si hay datos en la tabla Order
SELECT 'Últimos pedidos (si existen):' as info;
SELECT id, "orderNumber", "customerName", status, "createdAt" 
FROM "Order" 
ORDER BY "createdAt" DESC 
LIMIT 3;

-- 4. Probar inserción simple para ver qué error da
SELECT 'Probando inserción simple...' as info;
-- Esta consulta fallará si hay problemas, pero nos dirá cuál es el error exacto






