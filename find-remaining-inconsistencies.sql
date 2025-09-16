-- =====================================================
-- IDENTIFICAR INCONSISTENCIAS RESTANTES
-- Problema: 3 pedidos tienen pagos pero no están marcados como pagados
-- =====================================================

-- =====================================================
-- 1. PEDIDOS CON PAGOS PERO NO MARCADOS COMO PAGADOS
-- =====================================================

-- Mostrar los 3 pedidos problemáticos
SELECT 
    'PEDIDOS CON PAGOS NO MARCADOS COMO PAGADOS' as problema,
    o."orderNumber",
    o.status as estado_pedido,
    o."isPaid" as flag_pago,
    o."customerName",
    o."totalAmount",
    o."createdAt",
    -- Información de pagos
    COUNT(op.id) as cantidad_pagos,
    SUM(op.amount) as monto_pagado,
    STRING_AGG(pm.name, ', ') as metodos_pago
FROM "Order" o
JOIN "OrderPayment" op ON o.id = op."orderId"
JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
WHERE o."isPaid" = false
GROUP BY o.id, o."orderNumber", o.status, o."isPaid", o."customerName", o."totalAmount", o."createdAt"
ORDER BY o."createdAt" DESC;

-- =====================================================
-- 2. PEDIDOS ENTREGADOS PERO NO PAGADOS
-- =====================================================

-- Mostrar pedidos entregados (créditos)
SELECT 
    'PEDIDOS ENTREGADOS (CRÉDITOS)' as categoria,
    o."orderNumber",
    o.status as estado_pedido,
    o."isPaid" as flag_pago,
    o."customerName",
    o."totalAmount",
    o."createdAt",
    CASE 
        WHEN EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = o.id) THEN 'SÍ'
        ELSE 'NO'
    END as tiene_pagos
FROM "Order" o
WHERE o.status = 'ENTREGADO'
ORDER BY o."createdAt" DESC;

-- =====================================================
-- 3. ANÁLISIS DETALLADO DE ESTADOS
-- =====================================================

-- Matriz completa de estados
SELECT 
    'MATRIZ DE ESTADOS' as categoria,
    status as estado_pedido,
    "isPaid" as flag_pago,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as con_pagos
FROM "Order"
GROUP BY status, "isPaid"
ORDER BY status, "isPaid";

-- =====================================================
-- 4. CORRECCIÓN DE LOS 3 PEDIDOS PROBLEMÁTICOS
-- =====================================================

-- Marcar como pagados los 3 pedidos que tienen pagos pero no están marcados
UPDATE "Order" 
SET 
    "isPaid" = true,
    "updatedAt" = NOW()
WHERE EXISTS (
    SELECT 1 FROM "OrderPayment" op 
    WHERE op."orderId" = "Order".id
)
AND "isPaid" = false;

-- =====================================================
-- 5. VERIFICACIÓN POST-CORRECCIÓN
-- =====================================================

-- Verificar que se corrigieron
SELECT 
    'DESPUÉS DE CORRECCIÓN FINAL' as estado,
    COUNT(*) as total_pedidos,
    COUNT(*) FILTER (WHERE "isPaid" = true) as pedidos_marcados_pagados,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pedidos_con_pagos,
    COUNT(*) FILTER (WHERE status = 'PAGADO') as pedidos_estado_pagado,
    COUNT(*) FILTER (WHERE status = 'ENTREGADO') as pedidos_estado_entregado
FROM "Order";

-- =====================================================
-- 6. RESUMEN FINAL
-- =====================================================

-- Resumen final
WITH resumen AS (
    SELECT 
        COUNT(*) as total_pedidos,
        COUNT(*) FILTER (WHERE "isPaid" = true) as pedidos_marcados_pagados,
        COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pedidos_con_pagos,
        COUNT(*) FILTER (WHERE status = 'PAGADO') as pedidos_estado_pagado,
        COUNT(*) FILTER (WHERE status = 'ENTREGADO') as pedidos_estado_entregado
    FROM "Order"
)
SELECT 
    'RESUMEN FINAL' as categoria,
    r.total_pedidos,
    r.pedidos_marcados_pagados,
    r.pedidos_con_pagos,
    r.pedidos_estado_pagado,
    r.pedidos_estado_entregado,
    -- Diagnóstico
    CASE 
        WHEN r.pedidos_con_pagos = r.pedidos_marcados_pagados THEN '✅ CORRECTO: Todos los pedidos con pagos están marcados como pagados'
        ELSE '❌ PROBLEMA: Aún hay inconsistencias'
    END as diagnostico_final
FROM resumen r;
