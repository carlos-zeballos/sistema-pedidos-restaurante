-- =====================================================
-- CORRECCIÓN DE TRIGGERS DUPLICADOS
-- =====================================================
-- Problema: Hay dos triggers para generar orderNumber
-- Solución: Eliminar el duplicado y mantener solo el correcto

-- 1. ELIMINAR AMBOS TRIGGERS PROBLEMÁTICOS
-- =====================================================
DROP TRIGGER IF EXISTS trg_fill_order_number ON "Order";
DROP TRIGGER IF EXISTS trigger_generate_order_number ON "Order";
DROP FUNCTION IF EXISTS fill_order_number();
DROP FUNCTION IF EXISTS generate_order_number();

-- 2. CREAR FUNCIÓN CORRECTA (ÚNICA)
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si orderNumber ya tiene valor
    IF NEW."orderNumber" IS NULL OR NEW."orderNumber" = '' THEN
        -- Generar número único basado en fecha y contador
        NEW."orderNumber" := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                          LPAD(COALESCE((SELECT COUNT(*) FROM "Order" WHERE DATE("createdAt") = CURRENT_DATE), 0) + 1::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CREAR TRIGGER ÚNICO
-- =====================================================
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- 4. VERIFICAR QUE SOLO HAY UN TRIGGER
-- =====================================================
SELECT 'Triggers activos después de la corrección:' as info;
SELECT trigger_name, action_timing, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'Order'
ORDER BY trigger_name;

-- 5. OBTENER IDs PARA PRUEBA
-- =====================================================
SELECT 'Space ID para prueba:' as info;
SELECT id FROM "Space" WHERE "isActive" = true LIMIT 1;

SELECT 'User ID para prueba:' as info;
SELECT id FROM "User" WHERE isactive = true LIMIT 1;
