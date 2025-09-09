-- Script de prueba para verificar la función create_order_with_items
-- Ejecutar este script en Supabase para diagnosticar el problema

-- Verificar que la función existe y tiene los parámetros correctos
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'create_order_with_items'
AND n.nspname = 'public';

-- Verificar que los campos existen en la tabla Order
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Order'
AND column_name IN ('deliveryCost', 'isDelivery', 'orderPaymentMethodId', 'deliveryPaymentMethodId')
ORDER BY column_name;

-- Probar la función con datos de prueba
DO $$
DECLARE
    test_space_id uuid;
    test_user_id uuid;
    result_record record;
BEGIN
    -- Obtener un espacio de prueba
    SELECT id INTO test_space_id FROM "Space" WHERE "isActive" = true LIMIT 1;
    
    -- Obtener un usuario de prueba
    SELECT id INTO test_user_id FROM "User" WHERE "isactive" = true LIMIT 1;
    
    IF test_space_id IS NULL THEN
        RAISE EXCEPTION 'No hay espacios activos disponibles para la prueba';
    END IF;
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'No hay usuarios activos disponibles para la prueba';
    END IF;
    
    -- Probar la función
    SELECT * INTO result_record
    FROM create_order_with_items(
        p_space_id := test_space_id,
        p_created_by := test_user_id,
        p_customer_name := 'Cliente Prueba',
        p_customer_phone := '123456789',
        p_total_amount := 25.50,
        p_subtotal := 20.50,
        p_tax := 2.50,
        p_discount := 0,
        p_notes := 'Orden de prueba',
        p_items := '[{"productId": null, "comboId": null, "name": "Producto Prueba", "unitPrice": 10.25, "totalPrice": 20.50, "quantity": 2, "notes": "Notas de prueba"}]'::jsonb,
        p_delivery_cost := 5.00,
        p_is_delivery := true
    );
    
    RAISE NOTICE '✅ Función RPC ejecutada exitosamente. Orden creada: %', result_record.ordernumber;
    
    -- Limpiar la orden de prueba
    DELETE FROM "Order" WHERE id = result_record.id;
    RAISE NOTICE '✅ Orden de prueba eliminada';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en la función RPC: %', SQLERRM;
        RAISE;
END $$;

