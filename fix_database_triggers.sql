-- =====================================================
-- CORRECCIÓN DE TRIGGERS - ERROR 500
-- =====================================================
-- Problema: Desajuste entre nombres de columnas y triggers
-- Solución: Recrear triggers con nombres correctos

-- 1. ELIMINAR TRIGGERS Y FUNCIONES PROBLEMÁTICAS
-- =====================================================
DROP TRIGGER IF EXISTS trigger_generate_order_number ON "Order";
DROP FUNCTION IF EXISTS generate_order_number();
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON "Order";
DROP FUNCTION IF EXISTS log_order_status_change();

-- 2. RECREAR FUNCIÓN DE NÚMERO DE PEDIDO (CORREGIDA)
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Usar "orderNumber" con comillas para respetar camelCase
    IF NEW."orderNumber" IS NULL OR NEW."orderNumber" = '' THEN
        NEW."orderNumber" := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                          LPAD(COALESCE((SELECT COUNT(*) FROM "Order" WHERE DATE(createdAt) = CURRENT_DATE), 0) + 1::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. RECREAR TRIGGER DE NÚMERO DE PEDIDO
-- =====================================================
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- 4. RECREAR FUNCIÓN DE HISTORIAL DE ESTADO (CORREGIDA)
-- =====================================================
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        -- Usar createdBy en lugar de assignedTo (que puede ser NULL)
        INSERT INTO "OrderStatusHistory" (orderId, status, changedBy, notes)
        VALUES (NEW.id, NEW.status, NEW."createdBy", 'Cambio de estado automático');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. RECREAR TRIGGER DE HISTORIAL DE ESTADO
-- =====================================================
CREATE TRIGGER trigger_log_order_status_change
    AFTER UPDATE ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- =====================================================
-- VERIFICACIÓN DE CORRECCIÓN
-- =====================================================

-- Verificar columnas de la tabla Order
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Order' 
ORDER BY column_name;

-- Verificar triggers activos
SELECT trigger_name, action_timing, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'Order';

-- =====================================================
-- PRUEBA DE INSERCIÓN SEGURA
-- =====================================================

-- Función helper para crear pedidos de prueba
CREATE OR REPLACE FUNCTION create_test_order(
    p_space_id UUID,
    p_customer_name VARCHAR(100),
    p_customer_phone VARCHAR(20),
    p_created_by UUID,
    p_notes TEXT DEFAULT 'Pedido de prueba'
)
RETURNS UUID AS $$
DECLARE
    new_order_id UUID;
BEGIN
    INSERT INTO "Order" (
        "spaceId", 
        "customerName", 
        "customerPhone", 
        "createdBy", 
        "notes",
        "totalAmount",
        "subtotal"
    ) VALUES (
        p_space_id,
        p_customer_name,
        p_customer_phone,
        p_created_by,
        p_notes,
        0.00,
        0.00
    ) RETURNING id INTO new_order_id;
    
    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
/*
1. Ejecuta este script completo en tu base de datos
2. Verifica que no haya errores en la ejecución
3. Para probar, usa:

-- Obtener IDs válidos
SELECT id FROM "Space" WHERE isActive = true LIMIT 1;
SELECT id FROM "User" WHERE role = 'MOZO' LIMIT 1;

-- Crear pedido de prueba (reemplaza los UUIDs)
SELECT create_test_order(
    '<space-uuid>'::uuid,
    'Cliente Test',
    '123456789',
    '<user-uuid>'::uuid,
    'Prueba de corrección'
);

4. Si funciona, tu error 500 debería estar resuelto
*/






