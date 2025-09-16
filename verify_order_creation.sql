-- Script para verificar que el pedido se creó correctamente
-- Ejecuta este SQL para ver el pedido más reciente

-- 1. Ver el pedido más reciente creado
SELECT 
    id,
    "orderNumber",
    "customerName",
    "customerPhone",
    status,
    "totalAmount",
    "subtotal",
    notes,
    "createdBy",
    "assignedTo",
    "createdAt"
FROM "Order" 
ORDER BY "createdAt" DESC 
LIMIT 3;

-- 2. Verificar que el número de pedido se generó automáticamente
SELECT 
    'Número de pedido generado:' as mensaje,
    "orderNumber",
    "createdAt"
FROM "Order" 
WHERE "orderNumber" LIKE 'ORD-%'
ORDER BY "createdAt" DESC 
LIMIT 1;

-- 3. Ver el historial de estados del pedido más reciente
SELECT 
    osh.id,
    osh."orderId",
    osh.status,
    osh."changedBy",
    osh.notes,
    osh."createdAt"
FROM "OrderStatusHistory" osh
WHERE osh."orderId" = (
    SELECT id FROM "Order" ORDER BY "createdAt" DESC LIMIT 1
)
ORDER BY osh."createdAt" ASC;






