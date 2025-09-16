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
    "orderNumber",
    status,
    "isPaid",
    "customerName",
    "totalAmount",
    s.name as space_name,
    s.status as space_status
FROM "Order" o
JOIN "Space" s ON o."spaceId" = s.id
WHERE "orderNumber" = 'ORD-20250913-0009';

COMMIT;

