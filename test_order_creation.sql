-- =====================================================
-- PRUEBA DE CREACIÓN DE PEDIDO DESPUÉS DE CORRECCIÓN
-- =====================================================

-- 1. Obtener IDs válidos para la prueba
SELECT 'Espacios disponibles:' as info;
SELECT id, code, name, type FROM "Space" WHERE "isActive" = true LIMIT 5;

SELECT 'Usuarios disponibles:' as info;
SELECT id, username, role FROM "User" WHERE isactive = true LIMIT 5;

-- 2. Crear pedido de prueba usando la función helper
-- (Reemplaza los UUIDs con valores reales de las consultas anteriores)
/*
SELECT create_test_order(
    '<space-uuid>'::uuid,  -- Reemplaza con un UUID real de Space
    'Cliente Test',
    '123456789',
    '<user-uuid>'::uuid,   -- Reemplaza con un UUID real de User
    'Prueba después de corrección de triggers'
);
*/

-- 3. Verificar que el pedido se creó correctamente
SELECT 'Últimos pedidos creados:' as info;
SELECT id, "orderNumber", "customerName", status, "createdAt" 
FROM "Order" 
ORDER BY "createdAt" DESC 
LIMIT 3;

-- 4. Verificar que el trigger de historial funcionó
SELECT 'Historial de estados:' as info;
SELECT osh.id, o."orderNumber", osh.status, osh."createdAt"
FROM "OrderStatusHistory" osh
JOIN "Order" o ON osh."orderId" = o.id
ORDER BY osh."createdAt" DESC
LIMIT 3;

-- 5. Verificar triggers activos
SELECT 'Triggers activos en Order:' as info;
SELECT trigger_name, action_timing, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'Order';
