-- =====================================================
-- SCRIPT PARA INSERTAR DATOS DE PRUEBA EN REPORTES
-- =====================================================

-- 1. Verificar que tenemos espacios de delivery
SELECT id, code, name, type FROM "Space" WHERE type = 'DELIVERY' LIMIT 3;

-- 2. Verificar que tenemos usuarios activos
SELECT id, username, role FROM "User" WHERE isactive = true LIMIT 3;

-- 3. Crear una orden de prueba con delivery
DO $$
DECLARE
    v_space_id UUID;
    v_user_id UUID;
    v_order_id UUID;
    v_payment_method_id UUID;
BEGIN
    -- Obtener un espacio de delivery
    SELECT id INTO v_space_id FROM "Space" WHERE type = 'DELIVERY' AND "isActive" = true LIMIT 1;
    
    -- Obtener un usuario activo
    SELECT id INTO v_user_id FROM "User" WHERE isactive = true LIMIT 1;
    
    -- Obtener método de pago EFECTIVO
    SELECT id INTO v_payment_method_id FROM "PaymentMethod" WHERE name = 'EFECTIVO' LIMIT 1;
    
    IF v_space_id IS NOT NULL AND v_user_id IS NOT NULL AND v_payment_method_id IS NOT NULL THEN
        -- Crear orden de prueba
        INSERT INTO "Order" (
            "spaceId", "customerName", "customerPhone", "createdBy", 
            "notes", "totalAmount", "subtotal", "tax", "discount",
            "deliveryCost", "isDelivery"
        ) VALUES (
            v_space_id, 'Cliente Prueba', '999999999', v_user_id,
            'Orden de prueba para reportes', 25.00, 20.00, 2.00, 0.00,
            3.00, true
        ) RETURNING id INTO v_order_id;
        
        -- Crear pago del pedido
        INSERT INTO "OrderPayment" (
            "orderId", "paymentMethodId", "amount", "baseAmount", 
            "surchargeAmount", "isDeliveryService"
        ) VALUES (
            v_order_id, v_payment_method_id, 20.00, 20.00, 0.00, false
        );
        
        -- Crear pago del delivery
        INSERT INTO "OrderPayment" (
            "orderId", "paymentMethodId", "amount", "baseAmount", 
            "surchargeAmount", "isDeliveryService"
        ) VALUES (
            v_order_id, v_payment_method_id, 3.00, 3.00, 0.00, true
        );
        
        RAISE NOTICE 'Orden de prueba creada con ID: %', v_order_id;
    ELSE
        RAISE NOTICE 'No se pudo crear orden de prueba - faltan datos base';
    END IF;
END $$;

-- 4. Crear una orden normal (no delivery)
DO $$
DECLARE
    v_space_id UUID;
    v_user_id UUID;
    v_order_id UUID;
    v_payment_method_id UUID;
BEGIN
    -- Obtener un espacio que no sea delivery
    SELECT id INTO v_space_id FROM "Space" WHERE type != 'DELIVERY' AND "isActive" = true LIMIT 1;
    
    -- Obtener un usuario activo
    SELECT id INTO v_user_id FROM "User" WHERE isactive = true LIMIT 1;
    
    -- Obtener método de pago YAPE
    SELECT id INTO v_payment_method_id FROM "PaymentMethod" WHERE name = 'YAPE' LIMIT 1;
    
    IF v_space_id IS NOT NULL AND v_user_id IS NOT NULL AND v_payment_method_id IS NOT NULL THEN
        -- Crear orden de prueba
        INSERT INTO "Order" (
            "spaceId", "customerName", "customerPhone", "createdBy", 
            "notes", "totalAmount", "subtotal", "tax", "discount",
            "deliveryCost", "isDelivery"
        ) VALUES (
            v_space_id, 'Cliente Mesa', '888888888', v_user_id,
            'Orden de mesa para reportes', 15.00, 15.00, 0.00, 0.00,
            0.00, false
        ) RETURNING id INTO v_order_id;
        
        -- Crear pago del pedido
        INSERT INTO "OrderPayment" (
            "orderId", "paymentMethodId", "amount", "baseAmount", 
            "surchargeAmount", "isDeliveryService"
        ) VALUES (
            v_order_id, v_payment_method_id, 15.00, 15.00, 0.00, false
        );
        
        RAISE NOTICE 'Orden de mesa creada con ID: %', v_order_id;
    ELSE
        RAISE NOTICE 'No se pudo crear orden de mesa - faltan datos base';
    END IF;
END $$;

-- 5. Verificar que las órdenes se crearon correctamente
SELECT 
    o.id,
    o."orderNumber",
    o."customerName",
    o."isDelivery",
    o."deliveryCost",
    o."originalTotal",
    o."finalTotal",
    s.type as space_type
FROM "Order" o
JOIN "Space" s ON s.id = o."spaceId"
WHERE o."customerName" IN ('Cliente Prueba', 'Cliente Mesa')
ORDER BY o."createdAt" DESC;

-- 6. Verificar pagos creados
SELECT 
    op.id,
    op."orderId",
    pm.name as payment_method,
    op.amount,
    op."baseAmount",
    op."surchargeAmount",
    op."isDeliveryService",
    o."customerName"
FROM "OrderPayment" op
JOIN "PaymentMethod" pm ON pm.id = op."paymentMethodId"
JOIN "Order" o ON o.id = op."orderId"
WHERE o."customerName" IN ('Cliente Prueba', 'Cliente Mesa')
ORDER BY op."createdAt" DESC;

-- 7. Probar las vistas con datos reales
SELECT 'PaymentSummaryView' as vista, COUNT(*) as registros FROM "PaymentSummaryView"
UNION ALL
SELECT 'DeliveryPaymentSummaryView' as vista, COUNT(*) as registros FROM "DeliveryPaymentSummaryView"
UNION ALL
SELECT 'OrdersReportView' as vista, COUNT(*) as registros FROM "OrdersReportView";

-- 8. Mostrar datos de las vistas
SELECT * FROM "PaymentSummaryView";
SELECT * FROM "DeliveryPaymentSummaryView";
SELECT * FROM "OrdersReportView" ORDER BY "createdAt" DESC LIMIT 5;

-- =====================================================
-- ¡DATOS DE PRUEBA INSERTADOS!
-- =====================================================




