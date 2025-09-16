-- Eliminar orden ORD-20250913-0009 y todos sus datos relacionados
-- Ejecutar este SQL en el SQL Editor de Supabase

BEGIN;

-- 1. Obtener el ID de la orden
DO $$
DECLARE
    order_id UUID;
    space_id UUID;
BEGIN
    -- Buscar la orden
    SELECT id, "spaceId" INTO order_id, space_id
    FROM "Order"
    WHERE "orderNumber" = 'ORD-20250913-0009';
    
    IF order_id IS NULL THEN
        RAISE NOTICE 'Orden ORD-20250913-0009 no encontrada';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Eliminando orden: %', order_id;
    
    -- 2. Eliminar componentes de items
    DELETE FROM "OrderItemComponent"
    WHERE "orderItemId" IN (
        SELECT id FROM "OrderItem" WHERE "orderId" = order_id
    );
    
    -- 3. Eliminar items
    DELETE FROM "OrderItem" WHERE "orderId" = order_id;
    
    -- 4. Eliminar pagos
    DELETE FROM "OrderPayment" WHERE "orderId" = order_id;
    
    -- 5. Eliminar historial
    DELETE FROM "OrderStatusHistory" WHERE "orderId" = order_id;
    
    -- 6. Eliminar orden
    DELETE FROM "Order" WHERE id = order_id;
    
    -- 7. Liberar espacio
    UPDATE "Space" 
    SET status = 'LIBRE', "updatedAt" = NOW()
    WHERE id = space_id;
    
    RAISE NOTICE 'Orden ORD-20250913-0009 eliminada exitosamente';
    RAISE NOTICE 'Espacio liberado: %', space_id;
    
END $$;

COMMIT;

