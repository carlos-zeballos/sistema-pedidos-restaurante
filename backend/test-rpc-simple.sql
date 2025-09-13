-- =========================================================
-- TEST SIMPLE DE LA FUNCIÓN RPC
-- =========================================================
-- Este script hace una prueba básica de la función RPC
-- para verificar que está funcionando correctamente
-- =========================================================

-- 1. Verificar que la función existe
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'create_order_with_items' 
AND routine_schema = 'public';

-- 2. Verificar los parámetros
SELECT 
    parameter_name,
    parameter_mode,
    data_type,
    ordinal_position
FROM information_schema.parameters 
WHERE specific_name = (
    SELECT specific_name 
    FROM information_schema.routines 
    WHERE routine_name = 'create_order_with_items' 
    AND routine_schema = 'public'
    LIMIT 1
)
ORDER BY ordinal_position;

-- 3. Verificar que tenemos al menos un espacio disponible
SELECT id, name, status FROM "Space" LIMIT 1;

-- 4. Verificar que tenemos al menos un usuario
SELECT id, username FROM "User" LIMIT 1;

-- 5. Probar la función con datos reales (si existen)
DO $$
DECLARE
    v_space_id UUID;
    v_user_id UUID;
    v_result RECORD;
BEGIN
    -- Obtener un espacio disponible
    SELECT id INTO v_space_id FROM "Space" LIMIT 1;
    
    -- Obtener un usuario
    SELECT id INTO v_user_id FROM "User" LIMIT 1;
    
    IF v_space_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        -- Probar la función
        SELECT * INTO v_result FROM create_order_with_items(
            p_space_id := v_space_id,
            p_created_by := v_user_id,
            p_customer_name := 'Test Customer',
            p_customer_phone := '123456789',
            p_total_amount := 10.00,
            p_subtotal := 10.00,
            p_tax := 0.00,
            p_discount := 0.00,
            p_notes := 'Test order from SQL',
            p_items := '[{"productId": null, "comboId": null, "name": "Test Item", "unitPrice": 10.00, "totalPrice": 10.00, "quantity": 1, "notes": null}]'::jsonb,
            p_delivery_cost := 0.00,
            p_is_delivery := false
        );
        
        RAISE NOTICE '✅ Función RPC funcionando correctamente. Orden creada: %', v_result.ordernumber;
        
        -- Limpiar la orden de prueba
        DELETE FROM "Order" WHERE id = v_result.id;
        RAISE NOTICE '🧹 Orden de prueba eliminada';
        
    ELSE
        RAISE NOTICE '⚠️ No se encontraron espacios o usuarios para la prueba';
    END IF;
END $$;







