-- Arreglar orden ORD-20250913-0009 para que desaparezca de la vista de mozos
-- Ejecutar este SQL en el SQL Editor de Supabase

BEGIN;

-- 1. Marcar la orden como pagada
UPDATE "Order" 
SET 
    "isPaid" = true,
    "updatedAt" = NOW()
WHERE "orderNumber" = 'ORD-20250913-0009';

-- 2. Verificar si se actualizó correctamente
DO $$
DECLARE
    updated_rows INTEGER;
BEGIN
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    
    IF updated_rows = 0 THEN
        RAISE NOTICE 'Orden ORD-20250913-0009 no encontrada';
    ELSE
        RAISE NOTICE 'Orden ORD-20250913-0009 marcada como pagada (isPaid: true)';
    END IF;
END $$;

-- 3. Liberar el espacio si es necesario
UPDATE "Space" 
SET 
    status = 'LIBRE',
    "updatedAt" = NOW()
WHERE id = (
    SELECT "spaceId" 
    FROM "Order" 
    WHERE "orderNumber" = 'ORD-20250913-0009'
);

-- 4. Verificar resultado final
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

