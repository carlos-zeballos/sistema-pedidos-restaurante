-- Script para diagnosticar el cálculo de paidTotal
-- El problema: paidTotal está duplicando montos (S/ 137.80 en lugar de S/ 68.90)

-- 1. Ver la función RPC que calcula paidTotal
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_orders_report_by_date';

-- 2. Ver los datos de la orden específica ORD-20250914-0019
SELECT 
    o.id,
    o."orderNumber",
    o."finalTotal",
    o."originalTotal",
    -- Calcular paidTotal manualmente
    COALESCE(SUM(op.amount), 0) as calculated_paid_total,
    -- Ver todos los pagos
    json_agg(
        json_build_object(
            'method', pm.name,
            'amount', op.amount,
            'baseAmount', op."baseAmount",
            'surchargeAmount', op."surchargeAmount",
            'isDelivery', op."isDeliveryService",
            'paymentDate', op."paymentDate"
        )
    ) as payments_details
FROM "Order" o
LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
LEFT JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
WHERE o."orderNumber" = 'ORD-20250914-0019'
GROUP BY o.id, o."orderNumber", o."finalTotal", o."originalTotal";

-- 3. Ver si hay pagos duplicados
SELECT 
    o."orderNumber",
    op."paymentMethodId",
    pm.name as payment_method,
    op.amount,
    op."baseAmount",
    op."surchargeAmount",
    op."isDeliveryService",
    op."paymentDate",
    op."createdAt"
FROM "Order" o
JOIN "OrderPayment" op ON o.id = op."orderId"
JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
WHERE o."orderNumber" = 'ORD-20250914-0019'
ORDER BY op."paymentDate" DESC;
