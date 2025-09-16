-- =====================================================
-- SCRIPT PARA CORREGIR LA BASE DE DATOS EN PRODUCCIÓN
-- Ejecuta este SQL en el SQL Editor de Supabase (producción)
-- =====================================================

-- 1. ELIMINAR TRIGGERS Y FUNCIONES PROBLEMÁTICAS
DROP TRIGGER IF EXISTS trigger_generate_order_number ON "Order";
DROP FUNCTION IF EXISTS generate_order_number();
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON "Order";
DROP FUNCTION IF EXISTS log_order_status_change();
DROP TRIGGER IF EXISTS trg_fill_order_number ON "Order";
DROP FUNCTION IF EXISTS fill_order_number();

-- 2. RECREAR FUNCIÓN DE NÚMERO DE PEDIDO (CORREGIDA)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."orderNumber" IS NULL OR NEW."orderNumber" = '' THEN
        NEW."orderNumber" := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                          LPAD((COALESCE((SELECT COUNT(*) FROM "Order" WHERE DATE("createdAt") = CURRENT_DATE), 0) + 1)::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. RECREAR TRIGGER DE NÚMERO DE PEDIDO
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- 4. RECREAR FUNCIÓN DE HISTORIAL DE ESTADO (CORREGIDA)
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_changed_by UUID;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Usar assignedTo si existe, si no createdBy (siempre NOT NULL)
        v_changed_by := COALESCE(NEW."assignedTo", NEW."createdBy");
        
        INSERT INTO "OrderStatusHistory" (
            "orderId",
            status,
            "changedBy",
            notes,
            "createdAt"
        )
        VALUES (
            NEW.id,
            NEW.status,
            v_changed_by,
            'Cambio de estado automático',
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. RECREAR TRIGGER DE HISTORIAL DE ESTADO
CREATE TRIGGER trigger_log_order_status_change
    AFTER UPDATE ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- 6. VERIFICAR QUE LOS TRIGGERS ESTÁN ACTIVOS
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'Order'
ORDER BY trigger_name;

-- 7. PRUEBA RÁPIDA (opcional - descomenta si quieres probar)
/*
-- Obtener IDs válidos para prueba
SELECT 'Space ID:' as tipo, id as valor FROM "Space" WHERE "isActive" = true LIMIT 1;
SELECT 'User ID:' as tipo, id as valor FROM "User" WHERE isactive = true LIMIT 1;
*/

-- =====================================================
-- ¡CORRECCIONES APLICADAS EN PRODUCCIÓN!
-- =====================================================






