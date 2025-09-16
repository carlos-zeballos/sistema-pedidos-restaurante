BEGIN;

UPDATE "Order" 
SET 
    "isPaid" = true,
    "updatedAt" = NOW()
WHERE "orderNumber" = 'ORD-20250913-0009';

UPDATE "Space" 
SET 
    status = 'LIBRE',
    "updatedAt" = NOW()
WHERE id = (
    SELECT "spaceId" 
    FROM "Order" 
    WHERE "orderNumber" = 'ORD-20250913-0009'
);

SELECT 
    o."orderNumber",
    o.status as order_status,
    o."isPaid",
    o."customerName",
    o."totalAmount",
    s.name as space_name,
    s.status as space_status
FROM "Order" o
JOIN "Space" s ON o."spaceId" = s.id
WHERE o."orderNumber" = 'ORD-20250913-0009';

COMMIT;

