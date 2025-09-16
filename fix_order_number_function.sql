-- =====================================================
-- CORRECCIÓN DE LA FUNCIÓN generate_order_number()
-- =====================================================

-- Eliminar trigger y función problemática
DROP TRIGGER IF EXISTS trigger_generate_order_number ON "Order";
DROP FUNCTION IF EXISTS generate_order_number();

-- Crear función corregida
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si orderNumber ya tiene valor
    IF NEW."orderNumber" IS NULL OR NEW."orderNumber" = '' THEN
        -- Generar número único - CORREGIDO: convertir COUNT a TEXT antes de concatenar
        NEW."orderNumber" := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                          LPAD((COALESCE((SELECT COUNT(*) FROM "Order" WHERE DATE("createdAt") = CURRENT_DATE), 0) + 1)::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Verificar que la función y trigger se crearon correctamente
SELECT 'Función y trigger generate_order_number() recreados correctamente' as info;
