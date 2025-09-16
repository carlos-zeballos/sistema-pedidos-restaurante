-- =====================================================
-- PRUEBA DE CREACIÓN DE PEDIDO CON IDs REALES
-- =====================================================

-- Crear pedido de prueba usando los IDs obtenidos
SELECT create_test_order(
    '1a0a16ea-b645-457c-a3d1-86ca00159b7b'::uuid,  -- Space ID
    'Cliente Test',
    '123456789',
    '1a8a16ea-b645-457c-a3d1-86ca00159b7b'::uuid,  -- User ID
    'Prueba de corrección de triggers'
);

-- Verificar que el pedido se creó correctamente
SELECT 'Pedido creado:' as info;
SELECT id, "orderNumber", "customerName", status, "createdAt" 
FROM "Order" 
ORDER BY "createdAt" DESC 
LIMIT 1;

-- Verificar que el trigger de historial funcionó
SELECT 'Historial de estado creado:' as info;
SELECT osh.id, o."orderNumber", osh.status, osh."createdAt"
FROM "OrderStatusHistory" osh
JOIN "Order" o ON osh."orderId" = o.id
ORDER BY osh."createdAt" DESC
LIMIT 1;






