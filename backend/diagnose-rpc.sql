-- Script de diagnóstico para verificar la función RPC
-- Ejecutar este script en Supabase SQL Editor

-- 1. Verificar que la función existe
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'create_order_with_items'
AND n.nspname = 'public';

-- 2. Verificar que los campos existen en la tabla Order
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Order'
AND column_name IN ('deliveryCost', 'isDelivery', 'orderPaymentMethodId', 'deliveryPaymentMethodId')
ORDER BY column_name;

-- 3. Verificar que hay espacios disponibles
SELECT id, code, name, type, status, "isActive"
FROM "Space" 
WHERE "isActive" = true
LIMIT 5;

-- 4. Verificar que hay usuarios disponibles
SELECT id, username, "isactive"
FROM "User" 
WHERE "isactive" = true
LIMIT 3;








