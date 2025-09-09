-- =========================================================
-- SCRIPT DE VERIFICACIÓN DE LA FUNCIÓN RPC
-- =========================================================
-- Este script verifica que la función create_order_with_items
-- esté correctamente definida con todos los parámetros necesarios
-- =========================================================

-- 1. Verificar que la función existe
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'create_order_with_items' 
AND routine_schema = 'public';

-- 2. Verificar los parámetros de la función
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
)
ORDER BY ordinal_position;

-- 3. Verificar que la tabla Order tiene los campos de delivery
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Order' 
AND table_schema = 'public'
AND column_name IN ('deliveryCost', 'isDelivery', 'orderPaymentMethodId', 'deliveryPaymentMethodId')
ORDER BY column_name;

-- 4. Probar la función con parámetros mínimos
SELECT * FROM create_order_with_items(
    p_space_id := '00000000-0000-0000-0000-000000000001'::uuid,
    p_created_by := '00000000-0000-0000-0000-000000000001'::uuid,
    p_customer_name := 'Test Customer',
    p_customer_phone := '123456789',
    p_total_amount := 10.00,
    p_subtotal := 10.00,
    p_tax := 0.00,
    p_discount := 0.00,
    p_notes := 'Test order',
    p_items := '[{"productId": null, "comboId": null, "name": "Test Item", "unitPrice": 10.00, "totalPrice": 10.00, "quantity": 1, "notes": null}]'::jsonb,
    p_delivery_cost := 0.00,
    p_is_delivery := false
);

