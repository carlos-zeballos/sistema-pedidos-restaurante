-- =========================================================
-- VERIFICAR ESTRUCTURA DE LA TABLA OrderItem
-- =========================================================
-- Este script verifica la estructura real de la tabla OrderItem
-- =========================================================

-- Verificar estructura de la tabla OrderItem
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'OrderItem' 
AND table_schema = 'public'
ORDER BY ordinal_position;





