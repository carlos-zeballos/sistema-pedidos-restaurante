-- =====================================================
-- UNIFICACIÓN DE LÓGICA DE PAGOS
-- Problema: Dos sistemas separados (status + isPaid) crean inconsistencias
-- Solución: Un solo sistema basado en el estado del pedido
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ANÁLISIS DE LA SITUACIÓN ACTUAL
-- =====================================================

-- Mostrar la confusión actual
SELECT 
    'SITUACIÓN ACTUAL' as categoria,
    status as estado_pedido,
    "isPaid" as flag_pago,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order"
GROUP BY status, "isPaid"
ORDER BY status, "isPaid";

-- =====================================================
-- 2. PROPUESTA DE NUEVA LÓGICA
-- =====================================================

-- La nueva lógica será:
-- - PENDIENTE: Pedido creado, no pagado
-- - EN_PREPARACION: Pedido en cocina, no pagado
-- - LISTO: Pedido listo, no pagado
-- - ENTREGADO: Pedido entregado, no pagado (crédito)
-- - PAGADO: Pedido pagado (efectivo/tarjeta)

-- =====================================================
-- 3. CORRECCIÓN DE ESTADOS INCONSISTENTES
-- =====================================================

-- Caso 1: Pedidos ENTREGADOS con isPaid = true
-- Estos deberían ser ENTREGADOS (crédito) o PAGADOS (efectivo)
-- Vamos a asumir que si tienen pagos en OrderPayment, son PAGADOS
UPDATE "Order" 
SET 
    status = 'PAGADO',
    "updatedAt" = NOW()
WHERE status = 'ENTREGADO' 
    AND "isPaid" = true
    AND EXISTS (
        SELECT 1 FROM "OrderPayment" op 
        WHERE op."orderId" = "Order".id
    );

-- Caso 2: Pedidos ENTREGADOS con isPaid = false
-- Estos son créditos (entregados sin pago)
-- Los dejamos como ENTREGADOS

-- Caso 3: Pedidos PAGADOS con isPaid = false
-- Estos deberían ser PAGADOS
UPDATE "Order" 
SET 
    "isPaid" = true,
    "updatedAt" = NOW()
WHERE status = 'PAGADO' 
    AND "isPaid" = false;

-- =====================================================
-- 4. VERIFICACIÓN DE LA CORRECCIÓN
-- =====================================================

-- Verificar que no hay inconsistencias
SELECT 
    'DESPUÉS DE CORRECCIÓN' as estado,
    status as estado_pedido,
    "isPaid" as flag_pago,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order"
GROUP BY status, "isPaid"
ORDER BY status, "isPaid";

-- =====================================================
-- 5. ANÁLISIS DE PEDIDOS PARA REPORTES
-- =====================================================

-- Pedidos que deberían aparecer en reportes de métodos de pago
-- (Solo los que tienen pagos en OrderPayment)
SELECT 
    'PEDIDOS PARA REPORTES DE PAGOS' as categoria,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order"
WHERE EXISTS (
    SELECT 1 FROM "OrderPayment" op 
    WHERE op."orderId" = "Order".id
);

-- =====================================================
-- 6. RECOMENDACIÓN PARA PEDIDOS NUEVOS
-- =====================================================

-- Para pedidos nuevos, la lógica debería ser:
-- 1. Crear pedido con status = 'PENDIENTE'
-- 2. Cuando se pague, cambiar a status = 'PAGADO'
-- 3. Cuando se entregue, cambiar a status = 'ENTREGADO' (si es crédito)
-- 4. O mantener 'PAGADO' (si es efectivo)

-- =====================================================
-- 7. SCRIPT PARA PEDIDOS NUEVOS
-- =====================================================

-- Función para manejar pagos de pedidos nuevos
CREATE OR REPLACE FUNCTION public.process_payment(
    p_order_id UUID,
    p_payment_method_id UUID,
    p_amount NUMERIC(10,2),
    p_base_amount NUMERIC(10,2) DEFAULT NULL,
    p_surcharge_amount NUMERIC(10,2) DEFAULT NULL,
    p_is_delivery_service BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- 1. Insertar el pago en OrderPayment
    INSERT INTO "OrderPayment" (
        "orderId",
        "paymentMethodId",
        amount,
        "baseAmount",
        "surchargeAmount",
        "isDeliveryService",
        "paymentDate",
        "createdAt"
    ) VALUES (
        p_order_id,
        p_payment_method_id,
        p_amount,
        COALESCE(p_base_amount, p_amount),
        COALESCE(p_surcharge_amount, 0),
        p_is_delivery_service,
        NOW(),
        NOW()
    );
    
    -- 2. Cambiar el estado del pedido a PAGADO
    UPDATE "Order" 
    SET 
        status = 'PAGADO',
        "isPaid" = true,
        "updatedAt" = NOW()
    WHERE id = p_order_id;
    
    -- 3. Registrar el cambio de estado
    INSERT INTO "OrderStatusHistory" (
        "orderId",
        "status",
        "changedBy",
        "notes",
        "createdAt"
    ) VALUES (
        p_order_id,
        'PAGADO',
        (SELECT "createdBy" FROM "Order" WHERE id = p_order_id),
        'Pago procesado',
        NOW()
    );
    
    RETURN TRUE;
END;
$$;

-- Permisos para la función
REVOKE ALL ON FUNCTION public.process_payment(
    UUID, UUID, NUMERIC, NUMERIC, NUMERIC, BOOLEAN
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.process_payment(
    UUID, UUID, NUMERIC, NUMERIC, NUMERIC, BOOLEAN
) TO anon, authenticated;

-- =====================================================
-- 8. RESUMEN FINAL
-- =====================================================

-- Resumen final
WITH resumen AS (
    SELECT 
        COUNT(*) as total_pedidos,
        COUNT(*) FILTER (WHERE status = 'PAGADO') as pedidos_pagados,
        COUNT(*) FILTER (WHERE status = 'ENTREGADO') as pedidos_entregados,
        COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pedidos_con_pagos,
        COUNT(*) FILTER (WHERE status = 'PAGADO' AND EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pagados_con_pagos
    FROM "Order"
)
SELECT 
    'RESUMEN FINAL' as categoria,
    r.total_pedidos,
    r.pedidos_pagados,
    r.pedidos_entregados,
    r.pedidos_con_pagos,
    r.pagados_con_pagos,
    -- Diagnóstico
    CASE 
        WHEN r.pedidos_con_pagos = r.pagados_con_pagos THEN '✅ CORRECTO: Todos los pedidos con pagos están marcados como PAGADOS'
        ELSE '❌ PROBLEMA: Aún hay inconsistencias'
    END as diagnostico_final
FROM resumen r;

COMMIT;

-- =====================================================
-- 9. INSTRUCCIONES PARA PEDIDOS NUEVOS
-- =====================================================

-- Para pedidos nuevos:
-- 1. Crear pedido con status = 'PENDIENTE'
-- 2. Usar la función process_payment() cuando se pague
-- 3. Cambiar a 'ENTREGADO' solo si es crédito
-- 4. Los reportes de métodos de pago mostrarán solo los 'PAGADOS'
