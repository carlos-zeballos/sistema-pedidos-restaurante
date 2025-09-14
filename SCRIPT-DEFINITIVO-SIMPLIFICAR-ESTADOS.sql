-- =====================================================
-- SCRIPT DEFINITIVO PARA SIMPLIFICAR ESTADOS DE PEDIDOS
-- Elimina 'ENTREGADO' y convierte todo a 'PAGADO'
-- Maneja TODAS las dependencias correctamente
-- =====================================================

BEGIN;

-- 1) Verificar si el ENUM actual tiene 'ENTREGADO'
DO $$
DECLARE
    has_entregado BOOLEAN;
    entregado_count INTEGER;
BEGIN
    -- Verificar si 'ENTREGADO' existe en el ENUM
    SELECT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ENTREGADO' 
        AND enumtypid = 'order_status'::regtype
    ) INTO has_entregado;
    
    IF has_entregado THEN
        RAISE NOTICE 'ENTREGADO existe en el ENUM - procediendo con migración';
        
        -- Contar pedidos en estado ENTREGADO
        SELECT COUNT(*) INTO entregado_count
        FROM "Order" 
        WHERE status = 'ENTREGADO';
        
        RAISE NOTICE 'Pedidos en estado ENTREGADO que serán migrados: %', entregado_count;
        
        -- Crear nuevo ENUM sin 'ENTREGADO'
        CREATE TYPE order_status_new AS ENUM (
            'PENDIENTE',
            'EN_PREPARACION', 
            'LISTO',
            'PAGADO',
            'CANCELADO'
        );
        
        -- Agregar columna temporal en Order
        ALTER TABLE "Order" ADD COLUMN status_new order_status_new;
        
        -- Migrar datos de Order: convertir 'ENTREGADO' a 'PAGADO'
        UPDATE "Order" SET status_new = 
            CASE 
                WHEN status = 'ENTREGADO' THEN 'PAGADO'::order_status_new
                WHEN status = 'PENDIENTE' THEN 'PENDIENTE'::order_status_new
                WHEN status = 'EN_PREPARACION' THEN 'EN_PREPARACION'::order_status_new
                WHEN status = 'LISTO' THEN 'LISTO'::order_status_new
                WHEN status = 'PAGADO' THEN 'PAGADO'::order_status_new
                WHEN status = 'CANCELADO' THEN 'CANCELADO'::order_status_new
                ELSE 'PENDIENTE'::order_status_new
            END;
        
        -- Eliminar vistas que dependen de la columna status
        DROP VIEW IF EXISTS "KitchenView" CASCADE;
        DROP VIEW IF EXISTS "SpaceStatusView" CASCADE;
        DROP VIEW IF EXISTS "OrdersReportView" CASCADE;
        
        -- Eliminar columna antigua y renombrar nueva en Order
        ALTER TABLE "Order" DROP COLUMN status;
        ALTER TABLE "Order" RENAME COLUMN status_new TO status;
        
        -- Hacer lo mismo con OrderStatusHistory
        ALTER TABLE "OrderStatusHistory" ADD COLUMN status_new order_status_new;
        UPDATE "OrderStatusHistory" SET status_new = 
            CASE 
                WHEN status = 'ENTREGADO' THEN 'PAGADO'::order_status_new
                WHEN status = 'PENDIENTE' THEN 'PENDIENTE'::order_status_new
                WHEN status = 'EN_PREPARACION' THEN 'EN_PREPARACION'::order_status_new
                WHEN status = 'LISTO' THEN 'LISTO'::order_status_new
                WHEN status = 'PAGADO' THEN 'PAGADO'::order_status_new
                WHEN status = 'CANCELADO' THEN 'CANCELADO'::order_status_new
                ELSE 'PENDIENTE'::order_status_new
            END;
        ALTER TABLE "OrderStatusHistory" DROP COLUMN status;
        ALTER TABLE "OrderStatusHistory" RENAME COLUMN status_new TO status;
        
        -- Manejar OrderItem si tiene columna status
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'OrderItem' 
            AND column_name = 'status'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE "OrderItem" ADD COLUMN status_new order_status_new;
            UPDATE "OrderItem" SET status_new = 
                CASE 
                    WHEN status = 'ENTREGADO' THEN 'PAGADO'::order_status_new
                    WHEN status = 'PENDIENTE' THEN 'PENDIENTE'::order_status_new
                    WHEN status = 'EN_PREPARACION' THEN 'EN_PREPARACION'::order_status_new
                    WHEN status = 'LISTO' THEN 'LISTO'::order_status_new
                    WHEN status = 'PAGADO' THEN 'PAGADO'::order_status_new
                    WHEN status = 'CANCELADO' THEN 'CANCELADO'::order_status_new
                    ELSE 'PENDIENTE'::order_status_new
                END;
            ALTER TABLE "OrderItem" DROP COLUMN status;
            ALTER TABLE "OrderItem" RENAME COLUMN status_new TO status;
            RAISE NOTICE 'Columna status migrada en OrderItem';
        END IF;
        
        -- Eliminar el ENUM antiguo y renombrar el nuevo
        DROP TYPE order_status CASCADE;
        ALTER TYPE order_status_new RENAME TO order_status;
        
        -- Recrear las vistas con el nuevo ENUM
        CREATE VIEW "KitchenView" AS
        SELECT 
            o.id,
            o."orderNumber",
            o.status,
            o."createdAt",
            o."totalAmount",
            o."customerName",
            o."customerPhone",
            o.notes,
            s.name as space_name,
            u.username as created_by_username
        FROM "Order" o
        LEFT JOIN "Space" s ON o."spaceId" = s.id
        LEFT JOIN "User" u ON o."createdBy" = u.id
        WHERE o.status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO')
        ORDER BY o."createdAt" ASC;
        
        CREATE VIEW "SpaceStatusView" AS
        SELECT 
            s.id,
            s.name,
            s.status as space_status,
            COUNT(o.id) as active_orders,
            COALESCE(SUM(o."totalAmount"), 0) as total_amount
        FROM "Space" s
        LEFT JOIN "Order" o ON s.id = o."spaceId" 
            AND o.status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'PAGADO')
        GROUP BY s.id, s.name, s.status
        ORDER BY s.name;
        
        CREATE VIEW "OrdersReportView" AS
        SELECT 
            o.id,
            o."orderNumber",
            o.status,
            o."totalAmount",
            o."isPaid",
            o."createdAt",
            o."customerName",
            o."customerPhone",
            s.name as space_name,
            u.username as created_by_username,
            CASE 
                WHEN o.status = 'PAGADO' THEN 'Completado'
                WHEN o.status = 'CANCELADO' THEN 'Cancelado'
                ELSE 'En Proceso'
            END as status_display
        FROM "Order" o
        LEFT JOIN "Space" s ON o."spaceId" = s.id
        LEFT JOIN "User" u ON o."createdBy" = u.id
        ORDER BY o."createdAt" DESC;
        
        -- Actualizar historial si tiene columna notes
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'OrderStatusHistory' 
            AND column_name = 'notes'
            AND table_schema = 'public'
        ) THEN
            UPDATE "OrderStatusHistory" 
            SET notes = 'Estado actualizado: ENTREGADO → PAGADO (simplificación)'
            WHERE status = 'PAGADO' AND notes LIKE '%ENTREGADO%';
            RAISE NOTICE 'Historial de estados actualizado';
        END IF;
        
        RAISE NOTICE 'Migración completada exitosamente';
        
    ELSE
        RAISE NOTICE 'ENTREGADO no existe en el ENUM - migración ya realizada';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar distribución final de estados
SELECT 
  'DISTRIBUCIÓN FINAL DE ESTADOS' as categoria,
  status,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM "Order" 
GROUP BY status
ORDER BY status;

-- Verificar que las vistas funcionan
SELECT 
  'VERIFICACIÓN: VISTAS RECREADAS' as categoria,
  'KitchenView' as vista,
  COUNT(*) as registros
FROM "KitchenView"
UNION ALL
SELECT 
  'VERIFICACIÓN: VISTAS RECREADAS' as categoria,
  'SpaceStatusView' as vista,
  COUNT(*) as registros
FROM "SpaceStatusView"
UNION ALL
SELECT 
  'VERIFICACIÓN: VISTAS RECREADAS' as categoria,
  'OrdersReportView' as vista,
  COUNT(*) as registros
FROM "OrdersReportView";

-- Verificar consistencia entre status e isPaid
SELECT 
  'VERIFICACIÓN DE CONSISTENCIA STATUS vs isPaid' as categoria,
  status,
  "isPaid",
  COUNT(*) as cantidad
FROM "Order" 
GROUP BY status, "isPaid"
ORDER BY status, "isPaid";

-- Mostrar algunos ejemplos de pedidos
SELECT 
  'EJEMPLOS DE PEDIDOS' as categoria,
  "orderNumber",
  status,
  "isPaid",
  "totalAmount"
FROM "Order" 
ORDER BY "createdAt" DESC
LIMIT 10;

-- Mensaje final
SELECT 
  'RESUMEN FINAL' as categoria,
  'Estados simplificados correctamente' as descripcion,
  'Todos los pedidos terminan en estado PAGADO' as resultado;
