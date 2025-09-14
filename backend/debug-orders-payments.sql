-- =====================================================
-- DIAGNÓSTICO: Verificar órdenes y sus pagos
-- =====================================================

-- 1. Ver todas las órdenes con su información básica
SELECT 
    o.id,
    o."orderNumber",
    o.status,
    o."totalAmount",
    o."createdAt",
    s.name as space_name,
    s.type as space_type
FROM "Order" o
LEFT JOIN "Space" s ON o."spaceId" = s.id
ORDER BY o."createdAt" DESC
LIMIT 10;

-- 2. Ver todos los pagos registrados
SELECT 
    op.id,
    op."orderId",
    op.method,
    op.amount,
    op."isDelivery",
    op."paymentDate",
    o."orderNumber"
FROM "OrderPayment" op
LEFT JOIN "Order" o ON op."orderId" = o.id
ORDER BY op."paymentDate" DESC
LIMIT 10;

-- 3. Ver órdenes SIN pagos registrados
SELECT 
    o.id,
    o."orderNumber",
    o.status,
    o."totalAmount",
    o."createdAt",
    s.name as space_name
FROM "Order" o
LEFT JOIN "Space" s ON o."spaceId" = s.id
LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
WHERE op.id IS NULL
ORDER BY o."createdAt" DESC;

-- 4. Ver órdenes CON pagos registrados
SELECT 
    o.id,
    o."orderNumber",
    o.status,
    o."totalAmount",
    o."createdAt",
    s.name as space_name,
    COUNT(op.id) as payment_count
FROM "Order" o
LEFT JOIN "Space" s ON o."spaceId" = s.id
LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
WHERE op.id IS NOT NULL
GROUP BY o.id, o."orderNumber", o.status, o."totalAmount", o."createdAt", s.name
ORDER BY o."createdAt" DESC;

-- 5. Ver el conteo total
SELECT 
    'Total Orders' as type,
    COUNT(*) as count
FROM "Order"
UNION ALL
SELECT 
    'Orders with Payments' as type,
    COUNT(DISTINCT o.id) as count
FROM "Order" o
INNER JOIN "OrderPayment" op ON o.id = op."orderId"
UNION ALL
SELECT 
    'Orders without Payments' as type,
    COUNT(*) as count
FROM "Order" o
LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
WHERE op.id IS NULL;
